import { describe, expect, it, vi } from "vitest";

const { updateCallData } = vi.hoisted(() => ({ updateCallData: vi.fn() }));
vi.mock("./db", () => ({ addRepair: vi.fn(), createCall: vi.fn(), getCallBundle: vi.fn(), getCallByOs: vi.fn(), listCalls: vi.fn(), listHistoricalCalls: vi.fn(), productivity: vi.fn(), transitionCall: vi.fn(), updateCallData, updateUserProfile: vi.fn() }));

import { appRouter } from "./routers";

const ctx = { user: { id: 7, openId: "test", name: "Técnico", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };

describe("calls.updateData", () => {
  it("atualiza modelo, serial e queixa para o técnico autenticado", async () => {
    const expected = { call: { id: 21, modelo: "INFINIX HOT 50I", serial: "5A538SY82", queixa: "Equipamento apresenta desligamentos espontâneos." }, repairs: [], history: [] };
    updateCallData.mockResolvedValueOnce(expected);
    await expect(appRouter.createCaller(ctx).calls.updateData({ id: 21, modelo: "INFINIX HOT 50I", serial: "5A538SY82", queixa: "Equipamento apresenta desligamentos espontâneos." })).resolves.toEqual(expected);
    expect(updateCallData).toHaveBeenCalledWith(7, 21, { modelo: "INFINIX HOT 50I", serial: "5A538SY82", queixa: "Equipamento apresenta desligamentos espontâneos." });
  });
});
