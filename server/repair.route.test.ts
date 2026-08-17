import { describe, expect, it, vi } from "vitest";

const { addRepair, updateRepair, deleteRepair } = vi.hoisted(() => ({ addRepair: vi.fn(), updateRepair: vi.fn(), deleteRepair: vi.fn() }));
vi.mock("./db", () => ({ addRepair, updateRepair, deleteRepair, createCall: vi.fn(), deleteCall: vi.fn(), getCallBundle: vi.fn(), getCallByOs: vi.fn(), listCalls: vi.fn(), listHistoricalCalls: vi.fn(), productivity: vi.fn(), transitionCall: vi.fn(), updateCallData: vi.fn(), updateUserProfile: vi.fn() }));

import { appRouter } from "./routers";

const ctx = { user: { id: 7, openId: "test", name: "Técnico", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };

describe("calls.addRepair", () => {
  it("retorna a timeline com o evento de peça registrada", async () => {
    const bundle = { call: { id: 22 }, repairs: [{ id: 1, peca: "Display" }], history: [{ id: 4, evento: "Peça adicionada: Display", observacao: "Código: DISP-50" }] };
    addRepair.mockResolvedValueOnce(bundle);
    await expect(appRouter.createCaller(ctx).calls.addRepair({ chamadoId: 22, peca: "Display", codigo: "DISP-50" })).resolves.toEqual(bundle);
    expect(addRepair).toHaveBeenCalledWith(7, { chamadoId: 22, peca: "Display", codigo: "DISP-50" });
  });

  it("atualiza a mesma peça e devolve o bundle persistido para o técnico autenticado", async () => {
    const bundle = { call: { id: 22 }, repairs: [{ id: 9, peca: "Display novo" }], history: [{ id: 5, evento: "Peça atualizada: Display novo" }] };
    updateRepair.mockResolvedValueOnce(bundle);
    const input = { id: 9, chamadoId: 22, peca: "Display novo", codigo: "DISP-51", observacao: "Revisado" };
    await expect(appRouter.createCaller(ctx).calls.updateRepair(input)).resolves.toEqual(bundle);
    expect(updateRepair).toHaveBeenCalledWith(7, input);
  });

  it("exclui uma peça identificada no chamado do técnico e devolve a ficha atualizada", async () => {
    const bundle = { call: { id: 22 }, repairs: [], history: [{ id: 6, evento: "Peça excluída: Display" }] };
    deleteRepair.mockResolvedValueOnce(bundle);
    await expect(appRouter.createCaller(ctx).calls.deleteRepair({ id: 9, chamadoId: 22 })).resolves.toEqual(bundle);
    expect(deleteRepair).toHaveBeenCalledWith(7, { id: 9, chamadoId: 22 });
  });
});
