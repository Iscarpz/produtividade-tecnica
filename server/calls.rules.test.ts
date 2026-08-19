import { describe, expect, it } from "vitest";
import { isAllowedTransition, resolveNextCallStatus } from "./db";

describe("regras de transição dos chamados", () => {
  it("permite apenas ações compatíveis com a fila atual", () => {
    expect(isAllowedTransition("RECEBIDO", "Iniciar andamento")).toBe(true);
    expect(isAllowedTransition("EM ANDAMENTO", "Enviar para PP")).toBe(true);
    expect(isAllowedTransition("AGUARDANDO PP", "Troca")).toBe(true);
    expect(isAllowedTransition("AGUARDANDO PP", "Peça recebida")).toBe(true);
    expect(isAllowedTransition("AGUARDANDO ORÇAMENTO", "Recusado")).toBe(true);
    expect(isAllowedTransition("AGUARDANDO ORÇAMENTO", "Orçamento aprovado")).toBe(true);
    expect(isAllowedTransition("Zurich", "Orçamento recusado")).toBe(true);
    expect(isAllowedTransition("Zurich", "Orçamento aprovado")).toBe(true);
    expect(isAllowedTransition("Zurich", "Retornar para Andamento")).toBe(true);
    expect(isAllowedTransition("FINALIZADO", "Reabrir chamado")).toBe(true);
  });
  it("bloqueia ações impossíveis e estados encerrados", () => {
    expect(isAllowedTransition("FINALIZADO", "Finalizar")).toBe(false);
    expect(isAllowedTransition("RECEBIDO", "Enviar para PP")).toBe(false);
    expect(isAllowedTransition("TROCA", "Reabrir chamado")).toBe(false);
    expect(isAllowedTransition("TROCA", "Retornar para Andamento")).toBe(false);
    expect(isAllowedTransition("AGUARDANDO PP", "Recusado")).toBe(false);
  });

  it("encaminha Zurich aprovado para Reparo em andamento, permitindo finalizar após o serviço", () => {
    expect(resolveNextCallStatus("Zurich", "Orçamento aprovado")).toBe("EM ANDAMENTO");
    expect(isAllowedTransition(resolveNextCallStatus("Zurich", "Orçamento aprovado")!, "Finalizar")).toBe(true);
    expect(resolveNextCallStatus("Zurich", "Orçamento recusado")).toBe("RECUSADO");
  });

  it.each([
    ["RECEBIDO", "Iniciar andamento", "EM ANDAMENTO"],
    ["EM ANDAMENTO", "Enviar para PP", "AGUARDANDO PP"],
    ["EM ANDAMENTO", "Enviar para Orçamento", "AGUARDANDO ORÇAMENTO"],
    ["EM ANDAMENTO", "Enviar para Zurich", "Zurich"],
    ["AGUARDANDO PP", "Peça recebida", "EM ANDAMENTO"],
    ["AGUARDANDO PP", "Troca", "TROCA"],
    ["AGUARDANDO ORÇAMENTO", "Orçamento aprovado", "EM ANDAMENTO"],
    ["AGUARDANDO ORÇAMENTO", "Orçamento recusado", "RECUSADO"],
    ["Zurich", "Orçamento aprovado", "EM ANDAMENTO"],
    ["Zurich", "Orçamento recusado", "RECUSADO"],
    ["EM ANDAMENTO", "Finalizar", "FINALIZADO"],
    ["FINALIZADO", "Reabrir chamado", "EM ANDAMENTO"],
  ] as const)("mantém a sequência operacional %s → %s → %s", (from, action, to) => {
    expect(isAllowedTransition(from, action)).toBe(true);
    expect(resolveNextCallStatus(from, action)).toBe(to);
  });
});
