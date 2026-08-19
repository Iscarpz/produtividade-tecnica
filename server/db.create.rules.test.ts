import { describe, expect, it } from "vitest";
import { buildNewCallValues } from "./db";

describe("buildNewCallValues", () => {
  it("preserva cada campo textual nas colunas corretas e cria chamado aberto sem data de finalização", () => {
    const now = new Date("2026-08-14T17:02:59.226Z");
    const receipt = new Date("2026-08-10T03:00:00.000Z");
    const input = { numeroOs: "60006451515", serial: "4AJ99R29N", modelo: "POSITIVO / TABLET VAIO TL12 VJTL21B0111B", queixa: "O aparelho apresentou falha na câmera após retornar da assistência técnica.", queixaOriginal: "Aparelho retornou da assistência com problema na câmera.", dataRecebimento: receipt };
    expect(buildNewCallValues(1, input, now)).toEqual({ userId: 1, numeroOs: input.numeroOs, serial: input.serial, modelo: "VAIO TL12 VJTL21B0111B", queixa: input.queixa, queixaOriginal: input.queixaOriginal, status: "RECEBIDO", dataEntrada: receipt, dataInicioAndamento: null, dataFinalizacao: null, createdAt: now, updatedAt: now });
  });

  it("normaliza identificadores de borda sem cortar texto técnico longo ou caracteres especiais", () => {
    const now = new Date("2026-08-19T12:00:00.000Z");
    const complaint = `Falha intermitente USB-C/HDMI — BIOS v2.1, error 0xA1. ${"Observação técnica. ".repeat(120)}`;
    const values = buildNewCallValues(7, { numeroOs: "  60006459999  ", serial: "  ZXCVB-98765  ", modelo: "INFINIX SMART 10", queixa: complaint, queixaOriginal: complaint, dataRecebimento: now }, now);

    expect(values.numeroOs).toBe("60006459999");
    expect(values.serial).toBe("ZXCVB-98765");
    expect(values.queixa).toBe(complaint);
    expect(values.queixaOriginal).toBe(complaint);
  });
});
