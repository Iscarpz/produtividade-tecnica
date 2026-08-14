import { describe, expect, it } from "vitest";
import { buildNewCallValues } from "./db";

describe("buildNewCallValues", () => {
  it("cria chamado aberto sem data de finalização", () => {
    const now = new Date("2026-08-14T17:02:59.226Z");
    expect(buildNewCallValues(1, { numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Desliga apps sozinho." }, now)).toMatchObject({ userId: 1, status: "EM ANDAMENTO", dataFinalizacao: null, dataEntrada: now, createdAt: now, updatedAt: now });
  });
});
