import { describe, expect, it, vi } from "vitest";

const { addRepair } = vi.hoisted(() => ({ addRepair: vi.fn() }));
vi.mock("./db", () => ({ addRepair, createCall: vi.fn(), getCallBundle: vi.fn(), getCallByOs: vi.fn(), listCalls: vi.fn(), listHistoricalCalls: vi.fn(), productivity: vi.fn(), transitionCall: vi.fn(), updateCallData: vi.fn(), updateUserProfile: vi.fn() }));

import { appRouter } from "./routers";

const ctx = { user: { id: 7, openId: "test", name: "Técnico", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };

describe("calls.addRepair", () => {
  it("retorna a timeline com o evento de peça registrada", async () => {
    const bundle = { call: { id: 22 }, repairs: [{ id: 1, peca: "Display" }], history: [{ id: 4, evento: "Peça adicionada: Display", observacao: "Código: DISP-50" }] };
    addRepair.mockResolvedValueOnce(bundle);
    await expect(appRouter.createCaller(ctx).calls.addRepair({ chamadoId: 22, peca: "Display", codigo: "DISP-50" })).resolves.toEqual(bundle);
    expect(addRepair).toHaveBeenCalledWith(7, { chamadoId: 22, peca: "Display", codigo: "DISP-50" });
  });
});
