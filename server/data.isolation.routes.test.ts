import { describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  addRepair: vi.fn(), createCall: vi.fn(), deleteCall: vi.fn(), findInvitationByHash: vi.fn(), getCallBundle: vi.fn(), getCallByOs: vi.fn(), getUserByEmail: vi.fn(), insertInvitation: vi.fn(), isInvitationAvailable: vi.fn(), listCalls: vi.fn(), listHistoricalCalls: vi.fn(), listInvitationsForAdmin: vi.fn(), listUsersForAdmin: vi.fn(), productivity: vi.fn(), revokeInvitation: vi.fn(), setUserAccountStatus: vi.fn(), updateCallData: vi.fn(), updateUserProfile: vi.fn(), createInvitedUser: vi.fn(),
}));
vi.mock("./db", () => db);

import { appRouter } from "./routers";

function context(id: number) { return { user: { id, openId: `user-${id}`, name: `Técnico ${id}`, email: `tecnico${id}@example.com`, loginMethod: "invite-password", role: "user", accountStatus: "ACTIVE", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any }; }

describe("isolamento de dados por técnico", () => {
  it("propaga somente o id do usuário autenticado para chamados, detalhes, históricos e produtividade", async () => {
    db.listCalls.mockImplementation(async (userId: number) => [{ id: userId * 10, userId }]);
    db.getCallBundle.mockImplementation(async (userId: number, id: number) => ({ call: { id, userId }, repairs: [], history: [] }));
    db.listHistoricalCalls.mockResolvedValue([]); db.productivity.mockResolvedValue({});
    const technicianA = appRouter.createCaller(context(101)); const technicianB = appRouter.createCaller(context(202));
    await expect(technicianA.calls.list()).resolves.toEqual([{ id: 1010, userId: 101 }]);
    await expect(technicianB.calls.list()).resolves.toEqual([{ id: 2020, userId: 202 }]);
    await technicianA.calls.detail({ id: 11 }); await technicianB.calls.detail({ id: 22 });
    await technicianA.historical.troca(); await technicianB.productivity.range({ from: new Date("2026-08-01"), to: new Date("2026-08-31") });
    expect(db.listCalls).toHaveBeenNthCalledWith(1, 101, undefined, undefined);
    expect(db.listCalls).toHaveBeenNthCalledWith(2, 202, undefined, undefined);
    expect(db.getCallBundle).toHaveBeenCalledWith(101, 11);
    expect(db.getCallBundle).toHaveBeenCalledWith(202, 22);
    expect(db.listHistoricalCalls).toHaveBeenCalledWith(101, "TROCA", undefined);
    expect(db.productivity).toHaveBeenCalledWith(202, expect.any(Date), expect.any(Date));
  });
});
