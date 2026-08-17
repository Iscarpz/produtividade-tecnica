import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./LaudosPage.tsx", import.meta.url), "utf8");

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
    expect(source).toContain('new jsPDF("p", "mm", "a4")');
    expect(source).toContain("pdf.addPage()");
    expect(source).toContain("REGISTRO FOTOGRÁFICO");
    expect(source).toContain("Laudos gerados");
    expect(source).toContain("Ver histórico de ações");
    expect(source).toContain("settings.data?.logoPositivo");
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
