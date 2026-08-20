import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { buildLaudoPdf } from "../client/src/components/LaudoDocument";
import { prepareLaudoPhotosForPdf } from "./laudoDb";

const laudo = {
  numeroChamado: "60006459999", dataEmissao: "2026-08-20", marca: "Infinix", nomeCliente: "Cliente de validação", contato: "(41) 99999-9999", enderecoCliente: "Rua de teste, 100", cidadeCliente: "Curitiba", estadoCliente: "PR", produto: "SMART 10", tipoProduto: "Smartphone", numeroSerie: "SERIAL-VALIDACAO-001", bilheteSeguro: "", defeitoReclamado: "Equipamento não liga após uso normal.", avaliacaoTecnica: "Foram executados testes de alimentação, carga e inicialização.", conclusao: "Componente substituído e funcionamento validado.", responsavelTecnico: "Técnico de validação"
};

function highResolutionPhoto(seed: number) {
  const width = 2000;
  const height = 1500;
  const pixels = Buffer.allocUnsafe(width * height * 3);
  for (let index = 0; index < pixels.length; index += 1) pixels[index] = (index * 31 + seed * 67 + Math.floor(index / 11) * 17) % 256;
  return sharp(pixels, { raw: { width, height, channels: 3 } }).jpeg({ quality: 95 }).toBuffer();
}

describe("desempenho da emissão do Laudo Creator", () => {
  it("mantém um PDF de quatro evidências abaixo de 600 KB", async () => {
    const originals = await Promise.all([1, 2, 3, 4].map(async (seed) => `data:image/jpeg;base64,${(await highResolutionPhoto(seed)).toString("base64")}`));
    const photos = await prepareLaudoPhotosForPdf(42, originals);
    const pdf = buildLaudoPdf({ ...laudo, fotos: photos }, null);
    const binary = Buffer.from(pdf.output("arraybuffer"));
    const size = binary.byteLength;
    writeFileSync("/tmp/tecbase-laudo-performance.pdf", binary);

    expect(photos).toHaveLength(4);
    expect(photos.every((photo) => Buffer.from(photo.split(",")[1], "base64").byteLength <= 84 * 1024)).toBe(true);
    expect(size).toBeLessThan(600 * 1024);
  }, 20_000);
});
