import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { extractCustomerNameFromCall, getLaudoImageStorageKey, prepareLaudoPhotosForPdf } from "./laudoDb";

describe("pré-preenchimento do cliente no Laudo Creator", () => {
  it("extrai o nome do consumidor no texto bruto associado ao chamado", () => {
    const text = "Chamado: 60006473552\nConsumidor: MRIELA VILELA DE LIMA OLIVEIRA   Telefone: 35-999950072\nSerial: P512603020080\nGarantia: GARANTIA";

    expect(extractCustomerNameFromCall(text)).toBe("MRIELA VILELA DE LIMA OLIVEIRA");
  });

  it("mantém o cliente vazio quando o chamado não possui esse dado", () => {
    expect(extractCustomerNameFromCall("Chamado: 60006473552\nSerial: P512603020080")).toBe("");
  });

  it("aceita somente a foto persistida pelo próprio técnico antes de incorporá-la ao PDF", () => {
    expect(getLaudoImageStorageKey(42, "/manus-storage/laudos/42/foto-123.jpg")).toBe("laudos/42/foto-123.jpg");
    expect(() => getLaudoImageStorageKey(42, "/manus-storage/laudos/77/foto-123.jpg")).toThrow("A foto não pertence ao laudo atual.");
  });

  it("compacta uma evidência de alta resolução antes de enviá-la ao gerador de PDF", async () => {
    const original = await sharp({ create: { width: 3000, height: 2200, channels: 3, background: { r: 46, g: 125, b: 50 } } }).jpeg({ quality: 100 }).toBuffer();
    const [prepared] = await prepareLaudoPhotosForPdf(42, [`data:image/jpeg;base64,${original.toString("base64")}`]);
    const compressedBytes = Buffer.from(prepared.split(",")[1], "base64").byteLength;

    expect(prepared).toMatch(/^data:image\/jpeg;base64,/);
    expect(compressedBytes).toBeLessThanOrEqual(84 * 1024);
  });
});
