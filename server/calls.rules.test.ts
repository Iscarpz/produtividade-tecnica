import { describe, expect, it } from "vitest";
import { isAllowedTransition } from "./db";

describe("regras de transição dos chamados", () => {
  it("permite apenas ações compatíveis com a fila atual", () => {
    expect(isAllowedTransition("EM ANDAMENTO", "Enviar para PP")).toBe(true);
    expect(isAllowedTransition("AGUARDANDO PP", "Troca")).toBe(true);
    expect(isAllowedTransition("AGUARDANDO ORÇAMENTO", "Recusado")).toBe(true);
    expect(isAllowedTransition("AGUARDANDO SEGURADORA", "Retornar para Andamento")).toBe(true);
  });
  it("bloqueia ações impossíveis e estados encerrados", () => {
    expect(isAllowedTransition("FINALIZADO", "Finalizar")).toBe(false);
    expect(isAllowedTransition("TROCA", "Retornar para Andamento")).toBe(false);
    expect(isAllowedTransition("AGUARDANDO PP", "Recusado")).toBe(false);
  });
});
