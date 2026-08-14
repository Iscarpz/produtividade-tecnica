import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createInvitedUser: vi.fn(),
  findInvitationByHash: vi.fn(),
  getUserByEmail: vi.fn(),
  insertInvitation: vi.fn(),
  listInvitationsForAdmin: vi.fn(),
  listUsersForAdmin: vi.fn(),
  revokeInvitation: vi.fn(),
  setUserAccountStatus: vi.fn(),
}));
vi.mock("./db", () => ({ ...mocks, isInvitationAvailable: (invitation: { status: string; expiresAt: Date }) => invitation.status === "PENDING" && invitation.expiresAt > new Date() }));

import { usersRouter } from "./userRouter";

const admin = { user: { id: 1, openId: "admin", name: "Administrador", email: "admin@example.com", role: "admin", accountStatus: "ACTIVE", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };

describe("fluxo de convites", () => {
  it("gera convite único e cria cadastro aguardando autorização", async () => {
    mocks.insertInvitation.mockResolvedValueOnce(31);
    const invitation = await usersRouter.createCaller(admin).createInvitation({ name: "João Silva", email: "joao@example.com" });
    expect(invitation.id).toBe(31);
    expect(invitation.token).toHaveLength(43);
    expect(mocks.insertInvitation).toHaveBeenCalledWith(expect.objectContaining({ inviteeName: "João Silva", email: "joao@example.com", invitedByUserId: 1 }));

    mocks.findInvitationByHash.mockResolvedValueOnce({ id: 31, inviteeName: "João Silva", email: "joao@example.com", status: "PENDING", expiresAt: new Date(Date.now() + 86_400_000) });
    mocks.createInvitedUser.mockResolvedValueOnce(55);
    await expect(usersRouter.createCaller({ user: null, req: {} as any, res: {} as any }).registerWithInvitation({ token: invitation.token, name: "João Silva", email: "joao@example.com", password: "Senha-segura-123" })).resolves.toEqual({ success: true });
    expect(mocks.createInvitedUser).toHaveBeenCalledWith(expect.objectContaining({ invitationId: 31, name: "João Silva", email: "joao@example.com", openId: expect.stringMatching(/^invite_/) }));
  });

  it("recusa cadastro quando o convite já expirou", async () => {
    mocks.findInvitationByHash.mockResolvedValueOnce({ id: 32, inviteeName: "João", email: "joao@example.com", status: "PENDING", expiresAt: new Date(Date.now() - 1) });
    await expect(usersRouter.createCaller({ user: null, req: {} as any, res: {} as any }).registerWithInvitation({ token: "a".repeat(43), name: "João", email: "joao@example.com", password: "Senha-segura-123" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("autoriza o técnico cadastrado sem permitir alterar seu papel", async () => {
    mocks.setUserAccountStatus.mockResolvedValueOnce(undefined);
    await usersRouter.createCaller(admin).authorize({ userId: 55 });
    expect(mocks.setUserAccountStatus).toHaveBeenCalledWith(55, "ACTIVE");
  });
});
