import { describe, expect, it } from "vitest";
import { matchesCallSearch } from "../pages/CallSearch";
import { isOpenStatus, isProductivityEvent } from "./productivityRules";

describe("Rodada 4 rules", () => {
  it("busca por O.S. ou serial na mesma caixa", () => {
    const call = { numeroOs: "60006454345", serial: "5A538SY82" };
    expect(matchesCallSearch(call, "60006454345")).toBe(true);
    expect(matchesCallSearch(call, "5a538sy82")).toBe(true);
    expect(matchesCallSearch(call, "inexistente")).toBe(false);
  });
  it("mantém produtividade baseada em eventos e filas baseadas em status", () => {
    expect(isProductivityEvent("ENVIADO_ORCAMENTO")).toBe(true);
    expect(isProductivityEvent("AGUARDANDO ORÇAMENTO")).toBe(false);
    expect(isOpenStatus("AGUARDANDO ORÇAMENTO")).toBe(true);
    expect(isOpenStatus("FINALIZADO")).toBe(false);
  });
});
