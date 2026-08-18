import { describe, expect, it } from "vitest";
import { daysOpen, normalizeModelName, parseCallText } from "./callParser";

const officialText = `Número O.S.:\t60006454345\tAbertura:\t12/08/2026 08:09\tSerial:\t5A538SY82
Situação:\tSUPORTE TÉCNICO HW (E0026)\tTexto Breve:\tCELULAR
SLA:\t720 horas (HC)\tData Limite:\t11/09/2026
Modelo:\tINFINIX HOT 50I PRETO\tCódigo:\t000000000003902071
Material:\tSMART/MSG 2 CHIP P I\tGarantia:\t12\tContrato:\tPI Varejo
Cliente:\tPAULO ROGERIO DE LAIA\tTelefone:\t11-979572287
Causa:\tDESLIGANDO
Descrição:\tDESLIGANDO Sintoma: Desliga apps sozinho. Desliga sozinho. Trava durante utilização`;

describe("parseCallText", () => {
  it.each([
    ["Número O.S.: 60006454345", "60006454345"],
    ["Número O.S.:    60006454345    Abertura:", "60006454345"],
    ["Número O.S.:\n60006454345", "60006454345"],
    ["Numero O.S.: 60006454345", "60006454345"],
    ["Nº O.S.: 60006454345", "60006454345"],
  ])("extrai o chamado de forma determinística em variações de Número O.S.", (text, numeroOs) => {
    expect(parseCallText(text).numeroOs).toBe(numeroOs);
  });

  it("extrai o formato tabular real sem reescrever termos técnicos", () => {
    expect(parseCallText(officialText)).toEqual({ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Desliga apps sozinho. Desliga sozinho. Trava durante utilização", garantia: "GARANTIA", causa: "DESLIGANDO" });
  });
  it("aceita rótulos sem acento e separadores alternativos", () => {
    expect(parseCallText("Numero OS - 12345\nS/N: ABC999\nProduto: NOTEBOOK XYZ\nDefeito - Não liga")).toEqual({ numeroOs: "12345", serial: "ABC999", modelo: "NOTEBOOK XYZ", queixa: "Não liga" });
  });

  it("localiza chamado, modelo, serial, garantia e descrição pelo rótulo em texto completamente desformatado", () => {
    const text = `Chamado:\t60006451515\t \tMarca / Modelo:\tPOSITIVO / TABLET VAIO TL12 VJTL21B0111B
Situação:\tSUPORTE TÉCNICO HW (E0026)\tTexto Breve:\tTABLET
SLA:\t720 horas (HC)\tData Limite:\t09/09/2026
Consumidor:\tVIVALDO JÚNIOR\tTelefone:\t77-981466108
 SERIAL:\tGarantia:
 4AJ99R29N\t GARANTIA
Causa:\tCÂMERA COM FALHA
Descrição:\tAparelho retornou da assistência com problema na câmera.`;

    expect(parseCallText(text)).toEqual({ numeroOs: "60006451515", modelo: "VAIO TL12 VJTL21B0111B", serial: "4AJ99R29N", garantia: "GARANTIA", causa: "CÂMERA COM FALHA", queixa: "Aparelho retornou da assistência com problema na câmera." });
  });

  it.each([
    ["VAIO POSITIVO / TABLET VAIO TL12 VJTL21B0311B", "VAIO TL12 VJTL21B0311B"],
    ["POSITIVO / INFINIX SMART 10 PRATA PST", "INFINIX SMART 10 PRATA PST"],
    ["POSITIVO   VISION   TAB 10", "POSITIVO VISION TAB 10"],
    ["  VAIO   POSITIVO   FE14  ", "VAIO FE14"],
  ])("normaliza modelo com prioridade VAIO, INFINIX e POSITIVO", (modelo, expected) => {
    expect(normalizeModelName(modelo)).toBe(expected);
  });
});

describe("daysOpen", () => {
  it("conta o tempo corrido entre recebimento e data atual sem duplicar o dia inicial", () => {
    expect(daysOpen(new Date("2026-08-12T08:00:00Z"), new Date("2026-08-14T09:00:00Z"))).toBe(2);
  });
});
