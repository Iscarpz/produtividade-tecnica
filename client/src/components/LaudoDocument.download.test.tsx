// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateLaudoPdf } from "./LaudoDocument";

const laudo = { numeroChamado: "60006459999", dataEmissao: "2026-08-20", marca: "Infinix", nomeCliente: "Cliente de validação", contato: "(41) 99999-9999", enderecoCliente: "Rua de teste, 100", cidadeCliente: "Curitiba", estadoCliente: "PR", produto: "SMART 10", tipoProduto: "Smartphone", numeroSerie: "SERIAL-VALIDACAO-001", bilheteSeguro: "", defeitoReclamado: "Equipamento não liga.", avaliacaoTecnica: "Testes executados.", conclusao: "Avaliação concluída.", responsavelTecnico: "Técnico de validação", fotos: [] };

describe("download do Laudo Creator", () => {
  const createObjectURL = vi.fn(() => "blob:tecbase-laudo");
  const revokeObjectURL = vi.fn();
  let clickedAnchor: HTMLAnchorElement | null = null;

  afterEach(() => {
    vi.restoreAllMocks();
    clickedAnchor = null;
  });

  it("aciona o download do blob nativo com o nome do mesmo PDF emitido", () => {
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function(this: HTMLAnchorElement) { clickedAnchor = this; });

    const blob = generateLaudoPdf(laudo, null);

    expect(blob.type).toBe("application/pdf");
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickedAnchor?.href).toBe("blob:tecbase-laudo");
    expect(clickedAnchor?.download).toBe("Laudo_60006459999.pdf");
  });
});
