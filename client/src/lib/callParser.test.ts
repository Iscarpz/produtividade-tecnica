import { describe, expect, it } from "vitest";
import { daysOpen, parseCallText } from "./callParser";

describe("parseCallText", () => {
  it("extrai somente os campos relevantes do texto oficial", () => {
    const result = parseCallText(`Número O.S.: 60006454345\nSerial: 5A538SY82\nModelo: INFINIX HOT 50I PRETO\nCliente: Ignorado\nDescrição: DESLIGANDO Sintoma: Desliga apps sozinho.`);
    expect(result).toEqual({ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "DESLIGANDO Sintoma: Desliga apps sozinho." });
  });
  it("aceita variações de rótulo e separador", () => {
    const result = parseCallText("Numero OS - 12345\nS/N: ABC999\nProduto: NOTEBOOK XYZ\nDefeito - Não liga");
    expect(result).toEqual({ numeroOs: "12345", serial: "ABC999", modelo: "NOTEBOOK XYZ", queixa: "Não liga" });
  });
});

describe("daysOpen", () => {
  it("conta dias corridos incluindo o dia inicial", () => {
    expect(daysOpen(new Date("2026-08-12T08:00:00Z"), new Date("2026-08-14T09:00:00Z"))).toBe(3);
  });
});
