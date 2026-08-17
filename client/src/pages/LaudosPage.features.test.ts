import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./LaudosPage.tsx", import.meta.url), "utf8");
const documentSource = readFileSync(new URL("../components/LaudoDocument.tsx", import.meta.url), "utf8");

describe("Laudo Creator nativo — recursos preservados", () => {
  it("mantém upload, colagem, limite, compressão e anotação permanente das fotos", () => {
    expect(source).toContain("async function compressImage");
    expect(source).toContain('window.addEventListener("paste", paste)');
    expect(source).toContain("photos.length >= 4");
    expect(source).toContain('type: "circle" | "arrow"');
    expect(source).toContain("Aplicar anotações");
    expect(source).toContain('canvas.toDataURL("image/jpeg", 0.86)');
  });

  it("mantém o PDF A4 em duas páginas, histórico, auditoria e estado seguro sem logos", () => {
    expect(documentSource).toContain('new jsPDF("p", "mm", "a4")');
    expect(documentSource).toContain("pdf.addPage()");
    expect(documentSource).toContain("REGISTRO FOTOGRÁFICO");
    expect(source).toContain("Laudos gerados");
    expect(source).toContain("Ver histórico de ações");
    expect(source).toContain("settings.data?.logoPositivo");
  });

  it("gera o PDF em visor antes de permitir o download", () => {
    expect(documentSource).toContain("createLaudoPdfPreviewUrl");
    expect(documentSource).toContain('pdf.output("blob")');
    expect(source).toContain("Pré-visualização do PDF");
    expect(source).toContain('title="Pré-visualização do PDF do Laudo Técnico"');
    expect(source).toContain("Pré-visualizar PDF");
    expect(source).toContain("Baixar PDF");
    expect(source).toContain("disabled={!url}");
  });

  it("compõe logos proporcionais no documento e oferece estados claros na configuração", () => {
    expect(documentSource).toContain("object-contain");
    expect(documentSource).toContain("logoPositivo");
    expect(documentSource).toContain("logoInfinix");
    expect(documentSource).toContain("logoVaio");
    expect(documentSource).toContain("logoCompaq");
    expect(source).toContain("Logos institucionais");
    expect(source).toContain("Substituir logo");
    expect(source).toContain("Nenhuma logo cadastrada");
  });

  it("usa o título correto, opções legíveis e não exige cargo ou função", () => {
    expect(source).toContain("Laudo técnico");
    expect(source).not.toMatch(/Louvores técnicos/i);
    expect(source).toContain("Mau uso do equipamento");
    expect(source).toContain("Falha não identificada");
    expect(source).toContain("Equipamento aberto por pessoal não autorizado");
    expect(source).not.toContain("Cargo / função");
    expect(source).not.toContain("cargoTecnico");
  });
});
