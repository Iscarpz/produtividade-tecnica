import { describe, expect, it, vi } from "vitest";

const { updateCallData, updateCallTechnicalData } = vi.hoisted(() => ({ updateCallData: vi.fn(), updateCallTechnicalData: vi.fn() }));
vi.mock("./db", () => ({ addRepair: vi.fn(), checkNewCall: vi.fn(), createCall: vi.fn(), deleteCallAttachment: vi.fn(), getCallBundle: vi.fn(), getCallByOs: vi.fn(), listCalls: vi.fn(), listHistoricalCalls: vi.fn(), productivity: vi.fn(), transitionCall: vi.fn(), updateCallData, updateCallTechnicalData, updateUserProfile: vi.fn(), uploadCallAttachment: vi.fn() }));

import { appRouter } from "./routers";

const ctx = { user: { id: 7, openId: "test", name: "Técnico", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };

describe("calls.updateData", () => {
  it("atualiza modelo, serial e queixa para o técnico autenticado", async () => {
    const expected = { call: { id: 21, modelo: "INFINIX HOT 50I", serial: "5A538SY82", queixa: "Equipamento apresenta desligamentos espontâneos." }, repairs: [], history: [] };
    updateCallData.mockResolvedValueOnce(expected);
    await expect(appRouter.createCaller(ctx).calls.updateData({ id: 21, modelo: "INFINIX HOT 50I", serial: "5A538SY82", queixa: "Equipamento apresenta desligamentos espontâneos." })).resolves.toEqual(expected);
    expect(updateCallData).toHaveBeenCalledWith(7, 21, { modelo: "INFINIX HOT 50I", serial: "5A538SY82", queixa: "Equipamento apresenta desligamentos espontâneos." });
  });

  it("aceita diagnóstico e inspeção individualmente para o salvamento automático", async () => {
    updateCallTechnicalData.mockResolvedValueOnce({ call: { id: 21, diagnostico: "FALHA NO DISPLAY" }, repairs: [], history: [] });
    await expect(appRouter.createCaller(ctx).calls.updateTechnicalData({ id: 21, diagnostico: "FALHA NO DISPLAY" })).resolves.toMatchObject({ call: { diagnostico: "FALHA NO DISPLAY" } });
    expect(updateCallTechnicalData).toHaveBeenCalledWith(7, 21, { diagnostico: "FALHA NO DISPLAY", observacoes: undefined, inspecaoVisual: undefined });
  });

  it("preserva observações em salvamento separado do diagnóstico", async () => {
    const observacoes = "Cliente informou retorno após atualização.\nAguardar confirmação do setor.";
    updateCallTechnicalData.mockResolvedValueOnce({ call: { id: 21, observacoes }, repairs: [], attachments: [], history: [] });
    await expect(appRouter.createCaller(ctx).calls.updateTechnicalData({ id: 21, observacoes })).resolves.toMatchObject({ call: { observacoes } });
    expect(updateCallTechnicalData).toHaveBeenCalledWith(7, 21, { diagnostico: undefined, observacoes, inspecaoVisual: undefined });
  });
});
