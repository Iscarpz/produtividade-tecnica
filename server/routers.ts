import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { imageBiosManagerProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addRepair, createCall, createImageBiosCatalog, deleteCall, deleteImageBiosCatalog, deleteRepair, generateScriptForCall, getCallBundle, getCallByOs, listCalls, listHistoricalCalls, listImageBiosCatalog, productivity, transitionCall, updateCallData, updateCallTechnicalData, updateImageBiosCatalog, updateRepair, updateUserProfile } from "./db";
import { extractCallFromImage } from "./ocr";
import { formalizeComplaint } from "./complaint";
import { VISUAL_INSPECTIONS } from "./technicalScript";
import { usersRouter } from "./userRouter";

const dateRange = z.object({ from: z.coerce.date(), to: z.coerce.date() });
const imageBiosInput = z.object({ modelo: z.string().min(1).max(255), marca: z.string().min(1).max(120), tipo: z.enum(["IMAGEM", "BIOS"]), versao: z.string().min(1).max(3000), ativo: z.boolean().optional(), observacao: z.string().max(3000).optional() });
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
    list: protectedProcedure.input(z.object({ status: z.string().optional(), search: z.string().optional() }).optional()).query(({ ctx, input }) => listCalls(ctx.user.id, input?.status, input?.search)),
    detail: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const bundle = await getCallBundle(ctx.user.id, input.id);
      if (!bundle) throw new TRPCError({ code: "NOT_FOUND", message: "Chamado não encontrado" });
      return bundle;
    }),
    findByOs: protectedProcedure.input(z.object({ numeroOs: z.string() })).query(({ ctx, input }) => getCallByOs(ctx.user.id, input.numeroOs)),
    create: protectedProcedure.input(z.object({ numeroOs: z.string().min(1), serial: z.string().min(1), modelo: z.string().min(1), queixa: z.string().min(1), queixaOriginal: z.string().optional() })).mutation(({ ctx, input }) => createCall(ctx.user.id, input)),
    updateData: protectedProcedure.input(z.object({ id: z.number(), modelo: z.string().min(1).max(255), serial: z.string().min(1).max(128), queixa: z.string().min(1).max(3000) })).mutation(({ ctx, input }) => updateCallData(ctx.user.id, input.id, { modelo: input.modelo, serial: input.serial, queixa: input.queixa })),
    updateTechnicalData: protectedProcedure.input(z.object({ id: z.number(), diagnostico: z.string().min(1).max(3000), inspecaoVisual: z.enum(VISUAL_INSPECTIONS) })).mutation(({ ctx, input }) => updateCallTechnicalData(ctx.user.id, input.id, { diagnostico: input.diagnostico, inspecaoVisual: input.inspecaoVisual })),
    generateScript: protectedProcedure.input(z.object({ id: z.number() })).query(({ ctx, input }) => generateScriptForCall(ctx.user.id, input.id)),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => deleteCall(ctx.user.id, input.id)),
    transition: protectedProcedure.input(z.object({ id: z.number(), action: z.enum(["Enviar para PP", "Enviar para Orçamento", "Enviar para Zurich", "Retornar para Andamento", "Peça recebida", "Orçamento aprovado", "Orçamento recusado", "Finalizar", "Troca", "Recusado"]) })).mutation(({ ctx, input }) => transitionCall(ctx.user.id, input.id, input.action)),
    addRepair: protectedProcedure.input(z.object({ chamadoId: z.number(), peca: z.string().min(1), codigo: z.string().optional(), serialRetirada: z.string().optional(), serialInstalada: z.string().optional(), observacao: z.string().optional() })).mutation(({ ctx, input }) => addRepair(ctx.user.id, input)),
    updateRepair: protectedProcedure.input(z.object({ id: z.number(), chamadoId: z.number(), peca: z.string().min(1).max(255), codigo: z.string().max(128).optional(), serialRetirada: z.string().max(128).optional(), serialInstalada: z.string().max(128).optional(), observacao: z.string().max(3000).optional() })).mutation(({ ctx, input }) => updateRepair(ctx.user.id, input)),
    deleteRepair: protectedProcedure.input(z.object({ id: z.number(), chamadoId: z.number() })).mutation(({ ctx, input }) => deleteRepair(ctx.user.id, input)),
  }),
  imageBios: router({
    list: imageBiosManagerProcedure.input(z.object({ search: z.string().optional() }).optional()).query(({ input }) => listImageBiosCatalog(input?.search)),
    create: imageBiosManagerProcedure.input(imageBiosInput).mutation(({ input }) => createImageBiosCatalog(input)),
    update: imageBiosManagerProcedure.input(imageBiosInput.extend({ id: z.number() })).mutation(({ input }) => updateImageBiosCatalog(input.id, input)),
    delete: imageBiosManagerProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteImageBiosCatalog(input.id)),
  }),
  productivity: router({ range: protectedProcedure.input(dateRange).query(({ ctx, input }) => productivity(ctx.user.id, input.from, input.to)) }),
  historical: router({ troca: protectedProcedure.input(z.object({ search: z.string().optional() }).optional()).query(({ ctx, input }) => listHistoricalCalls(ctx.user.id, "TROCA", input?.search)), recusado: protectedProcedure.input(z.object({ search: z.string().optional() }).optional()).query(({ ctx, input }) => listHistoricalCalls(ctx.user.id, "RECUSADO", input?.search)) }),
});
export type AppRouter = typeof appRouter;
