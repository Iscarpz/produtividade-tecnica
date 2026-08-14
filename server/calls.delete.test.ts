import { describe, expect, it, vi } from "vitest";
import { deleteCallWithRelations } from "./db";

describe("exclusão íntegra de chamados", () => {
  it("remove reparos, histórico e produtividade antes do chamado principal", async () => {
    const sequence: string[] = [];
    const result = await deleteCallWithRelations({
      findCall: vi.fn(async () => ({ id: 42 })),
      deleteRepairs: vi.fn(async () => { sequence.push("reparos"); }),
      deleteHistory: vi.fn(async () => { sequence.push("historico"); }),
      deleteProductivityEvents: vi.fn(async () => { sequence.push("produtividade"); }),
      deleteCall: vi.fn(async () => { sequence.push("chamado"); }),
    });

    expect(result).toEqual({ success: true });
    expect(sequence).toEqual(["reparos", "historico", "produtividade", "chamado"]);
  });

  it("não remove nenhum dado quando o chamado não pertence ao usuário ou não existe", async () => {
    const deleteRepairs = vi.fn(async () => undefined);
    const deleteHistory = vi.fn(async () => undefined);
    const deleteProductivityEvents = vi.fn(async () => undefined);
    const deleteCall = vi.fn(async () => undefined);

    await expect(deleteCallWithRelations({
      findCall: vi.fn(async () => undefined),
      deleteRepairs,
      deleteHistory,
      deleteProductivityEvents,
      deleteCall,
    })).rejects.toThrow("Chamado não encontrado");

    expect(deleteRepairs).not.toHaveBeenCalled();
    expect(deleteHistory).not.toHaveBeenCalled();
    expect(deleteProductivityEvents).not.toHaveBeenCalled();
    expect(deleteCall).not.toHaveBeenCalled();
  });
});
