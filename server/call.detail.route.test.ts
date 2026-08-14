import { describe, expect, it, vi } from "vitest";

const { getCallBundle } = vi.hoisted(() => ({ getCallBundle: vi.fn() }));
vi.mock("./db", () => ({ addRepair: vi.fn(), createCall: vi.fn(), deleteCall: vi.fn(), getCallBundle, getCallByOs: vi.fn(), listCalls: vi.fn(), listHistoricalCalls: vi.fn(), productivity: vi.fn(), transitionCall: vi.fn(), updateCallData: vi.fn(), updateUserProfile: vi.fn() }));

import { appRouter } from "./routers";

const ctx = { user: { id: 7, openId: "test", name: "Técnico", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };

describe("calls.detail", () => {
  it("retorna NOT_FOUND quando o chamado não existe, sem produzir dados indefinidos", async () => {
    getCallBundle.mockResolvedValueOnce(undefined);

    await expect(appRouter.createCaller(ctx).calls.detail({ id: 60001 })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Chamado não encontrado",
    });
    expect(getCallBundle).toHaveBeenCalledWith(7, 60001);
  });
});
