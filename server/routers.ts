import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { imageBiosManagerProcedure, protectedProcedure, publicProcedure, router, teamManagerProcedure } from "./_core/trpc";
import { addRepair, checkNewCall, createCall, createImageBiosCatalog, deleteCall, deleteCallAttachment, deleteImageBiosCatalog, deleteRepair, generateScriptForCall, getCallBundle, getCallByOs, listCalls, listHistoricalCalls, listImageBiosCatalog, listTeamCalls, productivity, productivityForTeam, transitionCall, updateCallData, updateCallTechnicalData, updateImageBiosCatalog, updateRepair, updateUserProfile, uploadCallAttachment } from "./db";
import { extractCallFromImage } from "./ocr";
import { formalizeComplaint } from "./complaint";
import { VISUAL_INSPECTIONS } from "./technicalScript";
import { usersRouter } from "./userRouter";
import { createLaudo, deleteLaudo, duplicateLaudo, getLaudo, getLaudoPrefill, getLaudoSettings, LAUDO_BRANDS, listLaudoAudit, listLaudos, prepareLaudoPdfAssets, prepareLaudoPhotosForPdf, recordLaudoPdf, updateLaudoSettings, uploadLaudoImage } from "./laudoDb";

const dateRange = z.object({ from: z.coerce.date(), to: z.coerce.date() });
const callsListInput = z.object({ status: z.string().optional(), search: z.string().optional(), from: z.coerce.date().optional(), to: z.coerce.date().optional() }).refine((input) => (!input.from && !input.to) || Boolean(input.from && input.to), { message: "Informe a data inicial e final do período" });
const imageBiosInput = z.object({ modelo: z.string().min(1).max(255), marca: z.string().min(1).max(120), tipo: z.enum(["IMAGEM", "BIOS"]), versao: z.string().min(1).max(3000), ativo: z.boolean().optional(), observacao: z.string().max(3000).optional() });
const laudoInput = z.object({ chamadoId: z.number().optional().nullable(), numeroChamado: z.string().min(1).max(64), dataEmissao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), marca: z.enum(LAUDO_BRANDS), nomeCliente: z.string().min(1).max(255), contato: z.string().min(1).max(255), enderecoCliente: z.string().min(1).max(3000), cidadeCliente: z.string().min(1).max(160), estadoCliente: z.string().length(2), produto: z.string().min(1).max(255), tipoProduto: z.string().min(1).max(160), numeroSerie: z.string().min(5).max(128), bilheteSeguro: z.string().max(128).optional(), defeitoReclamado: z.string().min(1).max(3000), avaliacaoTecnica: z.string().min(1).max(3000), conclusao: z.string().min(1).max(5000), mauUso: z.boolean(), responsavelTecnico: z.string().min(1).max(255), fotos: z.array(z.string().min(1)).min(2).max(4), status: z.enum(["rascunho", "finalizado"]) });
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
    updateProfile: protectedProcedure.input(z.object({ name: z.string().min(1).max(120) })).mutation(({ ctx, input }) => updateUserProfile(ctx.user.id, input.name)),
  }),
  users: usersRouter,
  calls: router({
    extractFromImage: protectedProcedure.input(z.object({ imageDataUrl: z.string().min(32).max(12000000) })).mutation(({ input }) => extractCallFromImage(input.imageDataUrl)),
    formalizeComplaint: protectedProcedure.input(z.object({ queixaOriginal: z.string().min(1).max(3000) })).mutation(({ input }) => formalizeComplaint(input.queixaOriginal)),
    list: protectedProcedure.input(callsListInput.optional()).query(({ ctx, input }) => input?.from && input.to ? listCalls(ctx.user.id, input.status, input.search, input.from, input.to) : listCalls(ctx.user.id, input?.status, input?.search)),
    listTeam: teamManagerProcedure.input(z.object({ userId: z.number().int().positive().optional() }).optional()).query(({ input }) => listTeamCalls(input?.userId)),
    detail: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const bundle = await getCallBundle(ctx.user.id, input.id);
      if (!bundle) throw new TRPCError({ code: "NOT_FOUND", message: "Chamado não encontrado" });
      return bundle;
    }),
    findByOs: protectedProcedure.input(z.object({ numeroOs: z.string() })).query(({ ctx, input }) => getCallByOs(ctx.user.id, input.numeroOs)),
    checkNew: protectedProcedure.input(z.object({ numeroOs: z.string().max(64), serial: z.string().max(128) })).query(({ input }) => checkNewCall(input.numeroOs, input.serial)),
    create: protectedProcedure.input(z.object({ numeroOs: z.string().min(1), serial: z.string().min(1), modelo: z.string().min(1), queixa: z.string().min(1), queixaOriginal: z.string().optional(), dataRecebimento: z.coerce.date() })).mutation(({ ctx, input }) => createCall(ctx.user.id, input)),
    updateData: protectedProcedure.input(z.object({ id: z.number(), modelo: z.string().min(1).max(255), serial: z.string().min(1).max(128), queixa: z.string().min(1).max(3000) })).mutation(({ ctx, input }) => updateCallData(ctx.user.id, input.id, { modelo: input.modelo, serial: input.serial, queixa: input.queixa })),
    updateTechnicalData: protectedProcedure.input(z.object({ id: z.number(), diagnostico: z.string().max(3000).optional(), observacoes: z.string().max(6000).optional(), inspecaoVisual: z.enum(VISUAL_INSPECTIONS).optional() }).refine((input) => input.diagnostico !== undefined || input.observacoes !== undefined || input.inspecaoVisual !== undefined, { message: "Informe um dado técnico para salvar" })).mutation(({ ctx, input }) => updateCallTechnicalData(ctx.user.id, input.id, { diagnostico: input.diagnostico, observacoes: input.observacoes, inspecaoVisual: input.inspecaoVisual })),
    generateScript: protectedProcedure.input(z.object({ id: z.number() })).query(({ ctx, input }) => generateScriptForCall(ctx.user.id, input.id)),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => deleteCall(ctx.user.id, input.id)),
    transition: protectedProcedure.input(z.object({ id: z.number(), action: z.enum(["Iniciar andamento", "Enviar para PP", "Enviar para Orçamento", "Enviar para Zurich", "Retornar para Andamento", "Peça recebida", "Orçamento aprovado", "Orçamento recusado", "Finalizar", "Reabrir chamado", "Troca", "Recusado"]) })).mutation(({ ctx, input }) => transitionCall(ctx.user.id, input.id, input.action)),
    addRepair: protectedProcedure.input(z.object({ chamadoId: z.number(), peca: z.string().min(1), codigo: z.string().optional(), serialRetirada: z.string().optional(), serialInstalada: z.string().optional(), observacao: z.string().optional() })).mutation(({ ctx, input }) => addRepair(ctx.user.id, input)),
    updateRepair: protectedProcedure.input(z.object({ id: z.number(), chamadoId: z.number(), peca: z.string().min(1).max(255), codigo: z.string().max(128).optional(), serialRetirada: z.string().max(128).optional(), serialInstalada: z.string().max(128).optional(), observacao: z.string().max(3000).optional() })).mutation(({ ctx, input }) => updateRepair(ctx.user.id, input)),
    deleteRepair: protectedProcedure.input(z.object({ id: z.number(), chamadoId: z.number() })).mutation(({ ctx, input }) => deleteRepair(ctx.user.id, input)),
    uploadAttachment: protectedProcedure.input(z.object({ chamadoId: z.number(), nomeArquivo: z.string().min(1).max(255), dataUrl: z.string().min(16).max(40_000_000), tipo: z.enum(["ANEXO", "LAUDO_TECNICO"]).optional() })).mutation(({ ctx, input }) => uploadCallAttachment(ctx.user.id, input)),
    deleteAttachment: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => deleteCallAttachment(ctx.user.id, input.id)),
  }),
  imageBios: router({
    list: imageBiosManagerProcedure.input(z.object({ search: z.string().optional() }).optional()).query(({ input }) => listImageBiosCatalog(input?.search)),
    create: imageBiosManagerProcedure.input(imageBiosInput).mutation(({ input }) => createImageBiosCatalog(input)),
    update: imageBiosManagerProcedure.input(imageBiosInput.extend({ id: z.number() })).mutation(({ input }) => updateImageBiosCatalog(input.id, input)),
    delete: imageBiosManagerProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteImageBiosCatalog(input.id)),
  }),
  laudos: router({
    prefill: protectedProcedure.input(z.object({ chamadoId: z.number() })).query(({ ctx, input }) => getLaudoPrefill(ctx.user.id, input.chamadoId)),
    list: protectedProcedure.input(z.object({ search: z.string().optional(), marca: z.enum(LAUDO_BRANDS).optional() }).optional()).query(({ ctx, input }) => listLaudos(ctx.user.id, input?.search, input?.marca)),
    detail: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => { const laudo = await getLaudo(ctx.user.id, input.id); if (!laudo) throw new TRPCError({ code: "NOT_FOUND", message: "Laudo não encontrado" }); return laudo; }),
    create: protectedProcedure.input(laudoInput).mutation(({ ctx, input }) => createLaudo(ctx.user.id, input)),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => deleteLaudo(ctx.user.id, input.id)),
    duplicate: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => duplicateLaudo(ctx.user.id, input.id)),
    recordPdf: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => recordLaudoPdf(ctx.user.id, input.id)),
    preparePhotosForPdf: protectedProcedure.input(z.object({ photos: z.array(z.string().min(1)).min(1).max(4) })).mutation(({ ctx, input }) => prepareLaudoPhotosForPdf(ctx.user.id, input.photos)),
    preparePdfAssets: protectedProcedure.input(z.object({ photos: z.array(z.string().min(1)).min(1).max(4) })).mutation(({ ctx, input }) => prepareLaudoPdfAssets(ctx.user.id, input.photos)),
    audit: protectedProcedure.input(z.object({ laudoId: z.number() })).query(({ ctx, input }) => listLaudoAudit(ctx.user.id, input.laudoId)),
    uploadImage: protectedProcedure.input(z.object({ dataUrl: z.string().min(32).max(15000000), kind: z.enum(["foto", "logo"]) })).mutation(({ ctx, input }) => uploadLaudoImage(ctx.user.id, input.dataUrl, input.kind)),
    settings: router({
      get: protectedProcedure.query(() => getLaudoSettings()),
      update: imageBiosManagerProcedure.input(z.object({ logoPositivo: z.string().optional(), logoInfinix: z.string().optional(), logoVaio: z.string().optional(), logoCompaq: z.string().optional() })).mutation(({ ctx, input }) => updateLaudoSettings(ctx.user.id, input)),
    }),
  }),
  productivity: router({ range: protectedProcedure.input(dateRange).query(({ ctx, input }) => productivity(ctx.user.id, input.from, input.to)), teamRange: teamManagerProcedure.input(dateRange.extend({ userId: z.number().int().positive().optional() })).query(({ input }) => productivityForTeam(input.userId, input.from, input.to)) }),
  historical: router({ troca: protectedProcedure.input(z.object({ search: z.string().optional() }).optional()).query(({ ctx, input }) => listHistoricalCalls(ctx.user.id, "TROCA", input?.search)), recusado: protectedProcedure.input(z.object({ search: z.string().optional() }).optional()).query(({ ctx, input }) => listHistoricalCalls(ctx.user.id, "RECUSADO", input?.search)) }),
});
export type AppRouter = typeof appRouter;
