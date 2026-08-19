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

  it("faz o download diretamente a partir da visualização do laudo", () => {
    expect(source).toContain("Fazer download");
    expect(source).not.toContain("Pré-visualizar PDF");
    expect(source).not.toContain("Pré-visualização do PDF");
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

  it("oferece FEATUREPHONE, preenche o cliente do chamado e monta o cabeçalho institucional solicitado", () => {
    expect(source).toContain('"FEATUREPHONE"');
    expect(source).toContain("nomeCliente: p.nomeCliente || current.nomeCliente");
    expect(documentSource).toContain("Positivo Tecnologia");
    expect(documentSource).toContain("81.243.735/0019-77");
    expect(documentSource).toContain("Rua João Bettega, 5200 - Cidade Industrial");
    expect(documentSource).toContain("Curitiba - PR");
    expect(documentSource).toContain("Tel: (41) 3316-7500");
    expect(documentSource).toContain("grid-cols-2");
    expect(documentSource).toContain("LAUDO TÉCNICO - Nº");
    expect(documentSource).toContain("Data de Emissão:");
  });

  it("carrega cada foto antes de incorporá-la ao PDF final", () => {
    expect(documentSource).toContain("Não foi possível carregar a foto");
    expect(documentSource).toContain("preparePhotoForPdf");
    expect(documentSource).toContain("fetch(url)");
    expect(documentSource).toContain("pdf.addImage(photo.dataUrl");
    expect(documentSource).toContain('canvas.toDataURL("image/jpeg", 0.92)');
    expect(source).toContain("preparePhotosForPdf.mutateAsync");
    expect(source).toContain("generateLaudoPdf({ ...form, fotos }");
  });

  it("mantém o cabeçalho compacto e remove o texto institucional desnecessário", () => {
    expect(documentSource).toContain("grid-cols-[1fr_180px]");
    expect(documentSource).toContain("gap-x-2 gap-y-2");
    expect(documentSource).toContain('className="mt-1">Tel: (41) 3316-7500');
    expect(documentSource).not.toContain("Documento técnico emitido a partir das informações registradas no atendimento.");
  });
});
