import { describe, expect, it, vi } from "vitest";
import { persistRepairWithHistory } from "./db";

describe("persistRepairWithHistory", () => {
  it("persiste a peça, cria o evento técnico e somente retorna um bundle que contém o histórico", async () => {
    const insertedHistory: Array<{ evento: string; observacao?: string | null }> = [];
    const operations = {
      getCall: vi.fn().mockResolvedValue({ id: 22 }),
      insertRepair: vi.fn().mockResolvedValue(undefined),
      insertHistory: vi.fn().mockImplementation(async (event) => { insertedHistory.push(event); }),
      getBundle: vi.fn().mockImplementation(async () => ({ history: insertedHistory })),
    };

    const result = await persistRepairWithHistory(operations, 7, { chamadoId: 22, peca: "Display", codigo: "DISP-50", observacao: "Sem imagem" });

    expect(operations.insertRepair).toHaveBeenCalledTimes(1);
    expect(operations.insertHistory).toHaveBeenCalledWith(expect.objectContaining({ chamadoId: 22, userId: 7, evento: "Peça adicionada: Display", observacao: "Código: DISP-50 · Sem imagem" }));
    expect(result.history).toEqual([expect.objectContaining({ evento: "Peça adicionada: Display" })]);
  });
});
