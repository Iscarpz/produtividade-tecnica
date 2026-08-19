import { readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { buildLaudoPdf, generateLaudoPdf } from "../components/LaudoDocument";

const source = readFileSync(new URL("./LaudosPage.tsx", import.meta.url), "utf8");
const documentSource = readFileSync(new URL("../components/LaudoDocument.tsx", import.meta.url), "utf8");
const pixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const laudoData = { numeroChamado: "60006451515", dataEmissao: "2026-08-19", marca: "Positivo", nomeCliente: "Cliente de validação", contato: "41999999999", enderecoCliente: "Rua de teste, 10", cidadeCliente: "Curitiba", estadoCliente: "PR", produto: "FEATUREPHONE", tipoProduto: "FEATUREPHONE", numeroSerie: "ABC123456", bilheteSeguro: "", defeitoReclamado: "Não liga", avaliacaoTecnica: "Avaliação concluída", conclusao: "Falha identificada", responsavelTecnico: "Técnico de validação", fotos: [pixelPng, pixelPng] };

describe("Laudo Creator nativo — emissão confiável", () => {
  it("mantém upload, colagem, limite, anotação e ordenação manual das fotos", () => {
    expect(source).toContain("async function compressImage");
    expect(source).toContain('window.addEventListener("paste", paste)');
    expect(source).toContain("photos.length >= 4");
    expect(source).toContain('type: "circle" | "arrow"');
    expect(source).toContain("Aplicar anotações");
    expect(source).toContain("draggable");
    expect(source).toContain("onDragStart");
    expect(source).toContain("onDrop");
    expect(source).toContain("Arraste as fotos para definir a sequência do preview e do PDF.");
  });

  it("emite um PDF A4 nativo de duas páginas com fotos incorporadas", () => {
    const pdf = buildLaudoPdf(laudoData, null);
    expect(pdf.getNumberOfPages()).toBe(2);
    const binary = Buffer.from(pdf.output("arraybuffer"));
    expect(binary.subarray(0, 4).toString()).toBe("%PDF");
    writeFileSync("/tmp/tecbase-laudo-validation.pdf", binary);
  });

  it.each([2, 3, 4])("emite registro fotográfico sem erro com %i evidências", (totalFotos) => {
    const pdf = buildLaudoPdf({ ...laudoData, fotos: Array.from({ length: totalFotos }, () => pixelPng) }, null);
    expect(pdf.getNumberOfPages()).toBe(2);
    expect(Buffer.from(pdf.output("arraybuffer")).subarray(0, 4).toString()).toBe("%PDF");
  });

  it("dispara o download do arquivo PDF no navegador", async () => {
    const click = vi.fn(); const remove = vi.fn(); const anchor = { href: "", download: "", style: {}, click, remove };
    vi.stubGlobal("document", { createElement: vi.fn(() => anchor), body: { appendChild: vi.fn() } });
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:laudo"), revokeObjectURL: vi.fn() });
    vi.stubGlobal("window", { setTimeout: vi.fn((callback: () => void) => { callback(); return 1; }) });
    const blob = await generateLaudoPdf(laudoData, null);
    expect(anchor.download).toBe("Laudo_60006451515.pdf");
    expect(click).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
    expect(blob.size).toBeGreaterThan(0);
    vi.unstubAllGlobals();
  });

  it("faz o download por um link de arquivo e não depende de prévia, impressão ou html2canvas", () => {
    expect(source).toContain("Fazer download");
    expect(source).not.toContain("Pré-visualizar PDF");
    expect(documentSource).toContain('anchor.download = `Laudo_${data.numeroChamado}.pdf`');
    expect(documentSource).toContain("anchor.click()");
    expect(documentSource).not.toContain("html2canvas");
    expect(documentSource).not.toContain("oklch(");
  });

  it("mostra as duas páginas diretamente na pré-visualização", () => {
    expect(source).toContain("Página 1 de 2 — Laudo técnico");
    expect(source).toContain("Página 2 de 2 — Registro fotográfico");
    expect(source).toContain("LaudoPhotoPagePreview");
    expect(documentSource).toContain("Página {current} de 2");
  });

  it("compõe o cabeçalho compacto e mantém dados institucionais", () => {
    expect(documentSource).toContain("Positivo Tecnologia");
    expect(documentSource).toContain("81.243.735/0019-77");
    expect(documentSource).toContain("Rua João Bettega, 5200 - Cidade Industrial");
    expect(documentSource).toContain("Tel: (41) 3316-7500");
    expect(documentSource).toContain("grid-cols-[1fr_124px]");
    expect(documentSource).toContain("h-10");
    expect(documentSource).not.toContain("Documento técnico emitido a partir das informações registradas no atendimento.");
  });

  it("prepara fotos e logos persistidos antes de gerar o arquivo final", () => {
    expect(source).toContain("preparePdfAssets.mutateAsync");
    expect(source).toContain("setPreparedAssets(assets)");
    expect(source).toContain("generateLaudoPdf({ ...form, fotos: preparedAssets.fotos }, preparedAssets.logos)");
    expect(source).toContain("preview && preparedAssets");
    expect(documentSource).toContain("A foto ${index + 1} não foi preparada para o PDF.");
  });

  it("preserva FEATUREPHONE e o preenchimento automático do cliente", () => {
    expect(source).toContain('"FEATUREPHONE"');
    expect(source).toContain("nomeCliente: p.nomeCliente || current.nomeCliente");
  });

  it("anexa a mesma emissão PDF ao chamado quando o Laudo Creator vier de orçamento ou Zurich", () => {
    expect(source).toContain('laudoParams.get("movimento")');
    expect(source).toContain('movement === "orcamento" || movement === "zurich"');
    expect(source).toContain("uploadPdfAttachment.mutateAsync");
    expect(source).toContain('tipo: "LAUDO_TECNICO"');
    expect(source).toContain('`Laudo_Tecnico_${form.numeroChamado}.pdf`');
  });
});
