import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const invitePage = readFileSync(new URL("./pages/InviteAccept.tsx", import.meta.url), "utf8");

describe("identidade institucional TECBASE", () => {
  it("usa somente o símbolo TB oficial como favicon e ícone de instalação", () => {
    expect(indexHtml).toContain('rel="icon" type="image/png" href="/manus-storage/tecbase-favicon_f6f4ab39.png"');
    expect(indexHtml).toContain('rel="apple-touch-icon" href="/manus-storage/tecbase-favicon_f6f4ab39.png"');
    expect(indexHtml).not.toMatch(/favicon\.ico|produtivapp/i);
  });

  it("mantém os metadados e a tela de convite com a identificação TECBASE", () => {
    expect(indexHtml).toContain("<title>TECBASE — Gestão, Operação e Resultados</title>");
    expect(indexHtml).toContain('<html lang="pt-BR">');
    expect(invitePage).toContain(">TECBASE</p>");
    expect(invitePage).not.toContain("Produtividade Técnica");
  });
});
