import { describe, expect, it, vi } from "vitest";

const { checkNewCall, deleteCallAttachment, updateCallData, updateCallTechnicalData, uploadCallAttachment } = vi.hoisted(() => ({ checkNewCall: vi.fn(), deleteCallAttachment: vi.fn(), updateCallData: vi.fn(), updateCallTechnicalData: vi.fn(), uploadCallAttachment: vi.fn() }));
vi.mock("./db", () => ({ addRepair: vi.fn(), checkNewCall, createCall: vi.fn(), deleteCallAttachment, getCallBundle: vi.fn(), getCallByOs: vi.fn(), listCalls: vi.fn(), listHistoricalCalls: vi.fn(), productivity: vi.fn(), transitionCall: vi.fn(), updateCallData, updateCallTechnicalData, updateUserProfile: vi.fn(), uploadCallAttachment }));

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

  it("consulta duplicidade e reincidência sem expor dados adicionais", async () => {
    checkNewCall.mockResolvedValueOnce({ duplicateStatus: "FINALIZADO", hasSerialHistory: true });
    await expect(appRouter.createCaller(ctx).calls.checkNew({ numeroOs: "60006459999", serial: "SERIAL-EXISTENTE" })).resolves.toEqual({ duplicateStatus: "FINALIZADO", hasSerialHistory: true });
    expect(checkNewCall).toHaveBeenCalledWith("60006459999", "SERIAL-EXISTENTE");
  });

  it("vincula upload e remoção de anexos ao técnico autenticado", async () => {
    uploadCallAttachment.mockResolvedValueOnce({ id: 8, chamadoId: 21, userId: 7, nomeArquivo: "evidencia.pdf" });
    deleteCallAttachment.mockResolvedValueOnce({ success: true });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.calls.uploadAttachment({ chamadoId: 21, nomeArquivo: "evidencia.pdf", dataUrl: "data:application/pdf;base64,MTIzNA==" })).resolves.toMatchObject({ userId: 7 });
    await expect(caller.calls.deleteAttachment({ id: 8 })).resolves.toEqual({ success: true });
    expect(uploadCallAttachment).toHaveBeenCalledWith(7, expect.objectContaining({ chamadoId: 21, nomeArquivo: "evidencia.pdf" }));
    expect(deleteCallAttachment).toHaveBeenCalledWith(7, 8);
  });
});
