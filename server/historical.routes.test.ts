import { describe, expect, it, vi } from "vitest";

const { listHistoricalCalls } = vi.hoisted(() => ({ listHistoricalCalls: vi.fn() }));
vi.mock("./db", () => ({ addRepair: vi.fn(), createCall: vi.fn(), getCallBundle: vi.fn(), getCallByOs: vi.fn(), listCalls: vi.fn(), listHistoricalCalls, productivity: vi.fn(), transitionCall: vi.fn(), updateUserProfile: vi.fn() }));

import { appRouter } from "./routers";

const ctx = { user: { id: 7, openId: "test", name: "Técnico", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };

describe("historical routes", () => {
  it("consulta trocas com busca e retorna origem/data do evento", async () => {
    const row = { id: 1, numeroOs: "600", serial: "SN", modelo: "Modelo", queixa: "Troca", dataMovimento: new Date("2026-08-14"), origem: "AGUARDANDO PP" };
    listHistoricalCalls.mockResolvedValueOnce([row]);
    await expect(appRouter.createCaller(ctx).historical.troca({ search: "600" })).resolves.toEqual([row]);
    expect(listHistoricalCalls).toHaveBeenCalledWith(7, "TROCA", "600");
  });
  it("consulta recusados com busca por serial", async () => {
    listHistoricalCalls.mockResolvedValueOnce([]);
    await expect(appRouter.createCaller(ctx).historical.recusado({ search: "SN" })).resolves.toEqual([]);
    expect(listHistoricalCalls).toHaveBeenCalledWith(7, "RECUSADO", "SN");
  });
});
