import { describe, expect, it } from "vitest";
import { extractCustomerNameFromCall } from "./laudoDb";

describe("pré-preenchimento do cliente no Laudo Creator", () => {
  it("extrai o nome do consumidor no texto bruto associado ao chamado", () => {
    const text = "Chamado: 60006473552\nConsumidor: MRIELA VILELA DE LIMA OLIVEIRA   Telefone: 35-999950072\nSerial: P512603020080\nGarantia: GARANTIA";

    expect(extractCustomerNameFromCall(text)).toBe("MRIELA VILELA DE LIMA OLIVEIRA");
  });

  it("mantém o cliente vazio quando o chamado não possui esse dado", () => {
    expect(extractCustomerNameFromCall("Chamado: 60006473552\nSerial: P512603020080")).toBe("");
  });
});
