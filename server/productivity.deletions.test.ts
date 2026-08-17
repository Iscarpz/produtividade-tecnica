import { describe, expect, it } from "vitest";
import { buildProductivitySummary } from "./db";

describe("indicador persistente de chamados excluídos", () => {
  it("inclui exclusões no resumo sem depender de chamados operacionais existentes", () => {
    expect(buildProductivitySummary([{ type: "RECEBIDO", count: 3 }, { type: "FINALIZADO", count: 1 }], 2)).toEqual({ RECEBIDO: 3, FINALIZADO: 1, EXCLUIDO: 2 });
  });

  it("mantém zero exclusões quando nenhum registro de auditoria está no período filtrado", () => {
    expect(buildProductivitySummary([{ type: "ENVIADO_PP", count: 4 }], 0)).toEqual({ ENVIADO_PP: 4, EXCLUIDO: 0 });
  });
});
