import { describe, expect, it, vi } from "vitest";
import { deleteCallWithRelations } from "./db";

describe("exclusão íntegra de chamados", () => {
  it("remove os dados operacionais e preserva a auditoria de exclusão após o chamado principal", async () => {
    const sequence: string[] = [];
    const result = await deleteCallWithRelations({
      findCall: vi.fn(async () => ({ id: 42 })),
      deleteRepairs: vi.fn(async () => { sequence.push("reparos"); }),
      deleteHistory: vi.fn(async () => { sequence.push("historico"); }),
      deleteProductivityEvents: vi.fn(async () => { sequence.push("produtividade"); }),
      deleteCall: vi.fn(async () => { sequence.push("chamado"); }),
      recordDeletion: vi.fn(async () => { sequence.push("auditoria de exclusão"); }),
    });

    expect(result).toEqual({ success: true });
    expect(sequence).toEqual(["reparos", "historico", "produtividade", "chamado", "auditoria de exclusão"]);
  });

  it("não remove nenhum dado quando o chamado não pertence ao usuário ou não existe", async () => {
    const deleteRepairs = vi.fn(async () => undefined);
    const deleteHistory = vi.fn(async () => undefined);
    const deleteProductivityEvents = vi.fn(async () => undefined);
    const deleteCall = vi.fn(async () => undefined);
    const recordDeletion = vi.fn(async () => undefined);

    await expect(deleteCallWithRelations({
      findCall: vi.fn(async () => undefined),
      deleteRepairs,
      deleteHistory,
      deleteProductivityEvents,
      deleteCall,
      recordDeletion,
    })).rejects.toThrow("Chamado não encontrado");

    expect(deleteRepairs).not.toHaveBeenCalled();
    expect(deleteHistory).not.toHaveBeenCalled();
    expect(deleteProductivityEvents).not.toHaveBeenCalled();
    expect(deleteCall).not.toHaveBeenCalled();
    expect(recordDeletion).not.toHaveBeenCalled();
  });
});
