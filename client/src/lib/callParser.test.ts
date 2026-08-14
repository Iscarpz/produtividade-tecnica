import { describe, expect, it } from "vitest";
import { daysOpen, parseCallText } from "./callParser";

const officialText = `Número O.S.:\t60006454345\tAbertura:\t12/08/2026 08:09\tSerial:\t5A538SY82
Situação:\tSUPORTE TÉCNICO HW (E0026)\tTexto Breve:\tCELULAR
SLA:\t720 horas (HC)\tData Limite:\t11/09/2026
Modelo:\tINFINIX HOT 50I PRETO\tCódigo:\t000000000003902071
Material:\tSMART/MSG 2 CHIP P I\tGarantia:\t12\tContrato:\tPI Varejo
Cliente:\tPAULO ROGERIO DE LAIA\tTelefone:\t11-979572287
Causa:\tDESLIGANDO
Descrição:\tDESLIGANDO Sintoma: Desliga apps sozinho. Desliga sozinho. Trava durante utilização`;

describe("parseCallText", () => {
  it("extrai o formato tabular real e limpa causa/sintoma da queixa", () => {
    expect(parseCallText(officialText)).toEqual({ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Desliga apps sozinho. Desliga sozinho. Trava durante utilização" });
  });
  it("aceita rótulos sem acento e separadores alternativos", () => {
    expect(parseCallText("Numero OS - 12345\nS/N: ABC999\nProduto: NOTEBOOK XYZ\nDefeito - Não liga")).toEqual({ numeroOs: "12345", serial: "ABC999", modelo: "NOTEBOOK XYZ", queixa: "Não liga" });
  });
});

describe("daysOpen", () => {
  it("conta dias corridos incluindo o dia inicial", () => {
    expect(daysOpen(new Date("2026-08-12T08:00:00Z"), new Date("2026-08-14T09:00:00Z"))).toBe(3);
  });
});
