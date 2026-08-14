import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./CallDetail.tsx", import.meta.url), "utf8");

describe("CallDetail — exclusão", () => {
  it("mantém somente o botão na ficha e concentra o aviso completo no modal", () => {
    expect(source).toContain("Excluir chamado");
    expect(source).not.toContain("Ações irreversíveis");
    expect(source).not.toContain("A exclusão remove permanentemente");
    expect(source).toContain("Excluir chamado?");
    expect(source).toContain("incluindo reparos, peças, histórico e registros de produtividade");
    expect(source).toContain("Essa ação não pode ser desfeita.");
    expect(source).toContain(">Cancelar<");
    expect(source).toContain("Excluir permanentemente");
  });
});
