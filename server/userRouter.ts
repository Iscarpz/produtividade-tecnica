import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, publicProcedure, router, teamManagerProcedure } from "./_core/trpc";
import { createInvitationToken, hashInvitationToken, hashPassword, verifyPassword } from "./credentials";
import { createInvitedUser, findInvitationByHash, getUserByEmail, getUserById, insertInvitation, isInvitationAvailable, listInvitationsForAdmin, listTeamUsers, listUsersForAdmin, revokeInvitation, setUserAccountStatus, setUserRole } from "./db";

const inviteInput = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(320) });
const tokenInput = z.object({ token: z.string().min(32).max(256) });

function invitationPreview(invitation: Awaited<ReturnType<typeof findInvitationByHash>>) {
  if (!invitation || !isInvitationAvailable(invitation)) return { valid: false as const };
  return { valid: true as const, name: invitation.inviteeName, email: invitation.email, expiresAt: invitation.expiresAt };
}
async function assertManageableTechnician(actorId: number, userId: number) {
  if (actorId === userId) throw new TRPCError({ code: "BAD_REQUEST", message: "Sua própria conta não pode ser alterada nesta tela" });
  const target = await getUserById(userId);
  if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
  if (target.role === "admin") throw new TRPCError({ code: "FORBIDDEN", message: "A conta Owner não pode ser administrada" });
  return target;
}

export const usersRouter = router({
  invitationInfo: publicProcedure.input(tokenInput).query(async ({ input }) => invitationPreview(await findInvitationByHash(hashInvitationToken(input.token)))),
  registerWithInvitation: publicProcedure.input(tokenInput.extend({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(320), password: z.string().min(8).max(128) })).mutation(async ({ input }) => {
    const invitation = await findInvitationByHash(hashInvitationToken(input.token));
    if (!invitation || !isInvitationAvailable(invitation)) throw new TRPCError({ code: "BAD_REQUEST", message: "Convite inválido, expirado ou já utilizado" });
    if (input.email.trim().toLowerCase() !== invitation.email.toLowerCase()) throw new TRPCError({ code: "BAD_REQUEST", message: "Use o e-mail informado no convite" });
    const passwordHash = await hashPassword(input.password);
    await createInvitedUser({ invitationId: invitation.id, name: input.name, email: input.email, passwordHash, openId: `invite_${crypto.randomUUID()}` });
    return { success: true as const };
  }),
  loginWithPassword: publicProcedure.input(z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
    const user = await getUserByEmail(input.email);
    if (!user || !await verifyPassword(input.password, user.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha inválidos" });
    if (user.accountStatus !== "ACTIVE") return { accountStatus: user.accountStatus } as const;
    const { sdk } = await import("./_core/sdk");
    const { COOKIE_NAME } = await import("@shared/const");
    const { getSessionCookieOptions } = await import("./_core/cookies");
    const token = await sdk.createSessionToken(user.openId, { name: user.name || user.email || "Técnico" });
    ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 31536000000 });
    return { accountStatus: "ACTIVE" as const };
  }),
  list: teamManagerProcedure.query(({ ctx }) => ctx.user.role === "admin" ? listUsersForAdmin() : listTeamUsers()),
  listInvitations: teamManagerProcedure.query(() => listInvitationsForAdmin()),
  createInvitation: teamManagerProcedure.input(inviteInput).mutation(async ({ ctx, input }) => {
    const token = createInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const id = await insertInvitation({ tokenHash: hashInvitationToken(token), inviteeName: input.name, email: input.email, invitedByUserId: ctx.user.id, expiresAt });
    return { id, token, expiresAt };
  }),
  revokeInvitation: teamManagerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => revokeInvitation(input.id)),
  authorize: teamManagerProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await assertManageableTechnician(ctx.user.id, input.userId);
    return setUserAccountStatus(input.userId, "ACTIVE");
  }),
  refuse: teamManagerProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await assertManageableTechnician(ctx.user.id, input.userId);
    return setUserAccountStatus(input.userId, "REFUSED");
  }),
  revoke: teamManagerProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await assertManageableTechnician(ctx.user.id, input.userId);
    return setUserAccountStatus(input.userId, "REVOKED");
  }),
  setRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), role: z.enum(["user", "manager"]) })).mutation(async ({ ctx, input }) => {
    if (ctx.user.id === input.userId) throw new TRPCError({ code: "BAD_REQUEST", message: "Sua própria conta não pode ser alterada nesta tela" });
    const target = await getUserById(input.userId);
    if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
    if (target.role === "admin") throw new TRPCError({ code: "FORBIDDEN", message: "A conta Owner não pode ser alterada" });
    return setUserRole(input.userId, input.role);
  }),
});
