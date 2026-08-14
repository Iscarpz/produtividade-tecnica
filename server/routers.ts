import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addRepair, createCall, getCallBundle, getCallByOs, listCalls, productivity, transitionCall } from "./db";

const dateRange = z.object({ from: z.coerce.date(), to: z.coerce.date() });
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  calls: router({
    list: protectedProcedure.input(z.object({ status: z.string().optional(), search: z.string().optional() }).optional()).query(({ ctx, input }) => listCalls(ctx.user.id, input?.status, input?.search)),
    detail: protectedProcedure.input(z.object({ id: z.number() })).query(({ ctx, input }) => getCallBundle(ctx.user.id, input.id)),
    findByOs: protectedProcedure.input(z.object({ numeroOs: z.string() })).query(({ ctx, input }) => getCallByOs(ctx.user.id, input.numeroOs)),
    create: protectedProcedure.input(z.object({ numeroOs: z.string().min(1), serial: z.string().min(1), modelo: z.string().min(1), queixa: z.string().min(1) })).mutation(({ ctx, input }) => createCall(ctx.user.id, input)),
    transition: protectedProcedure.input(z.object({ id: z.number(), action: z.enum(["Enviar para PP", "Enviar para Orçamento", "Enviar para Seguradora", "Retornar para Andamento", "Finalizar", "Troca", "Recusado"]) })).mutation(({ ctx, input }) => transitionCall(ctx.user.id, input.id, input.action)),
    addRepair: protectedProcedure.input(z.object({ chamadoId: z.number(), peca: z.string().min(1), codigo: z.string().optional(), serialRetirada: z.string().optional(), serialInstalada: z.string().optional(), observacao: z.string().optional() })).mutation(({ ctx, input }) => addRepair(ctx.user.id, input)),
  }),
  productivity: router({ range: protectedProcedure.input(dateRange).query(({ ctx, input }) => productivity(ctx.user.id, input.from, input.to)) }),
});
export type AppRouter = typeof appRouter;
