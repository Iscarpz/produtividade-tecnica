import { describe, expect, it } from "vitest";
import { generateTechnicalScript, type CatalogEntry, VISUAL_INSPECTIONS } from "./technicalScript";

const catalog: CatalogEntry[] = [
  { modelo: "INFINIX HOT 50I", marca: "INFINIX", tipo: "IMAGEM", versao: "X6531B-V631BEAFAHAIAJAKAMANANOP-U-OP-260314V1118", ativo: true },
  { modelo: "N14JP9R", marca: "POSITIVO", tipo: "BIOS", versao: "V1.13.X", ativo: true },
];
const complete = { numeroOs: "60006451515", modelo: "HOT 50I", serial: "ABC123", queixa: "Aparelho não liga.", diagnostico: "Falha constatada no circuito de carga.", inspecaoVisual: VISUAL_INSPECTIONS[0] };

describe("gerador técnico estruturado", () => {
  it("bloqueia a geração e informa cada dado técnico obrigatório ausente", () => {
    const result = generateTechnicalScript({ numeroOs: "1", modelo: "", serial: "", queixa: "", diagnostico: "", inspecaoVisual: null }, [], catalog);
    expect(result.script).toBeUndefined();
    expect(result.errors).toEqual(expect.arrayContaining(["Informe o modelo do equipamento.", "Informe a queixa formalizada.", "Informe o diagnóstico do equipamento.", "Selecione a inspeção visual/testes de hardware."]));
  });

  it("normaliza Infinix, usa a imagem cadastrada, garantia e peças com seriais sem expor código interno", () => {
    const result = generateTechnicalScript(complete, [{ peca: "LCD", codigo: "123456", serialRetirada: "OLD-1", serialInstalada: "NEW-1" }], catalog);
    expect(result.errors).toEqual([]);
    expect(result.equipmentType).toBe("SMARTPHONE/TABLET");
    expect(result.script).toContain("[MODELO:]\nINFINIX HOT 50I\n/");
    expect(result.script).toContain("[VERSAO DA IMAGEM INSTALADA:]\nIMAGEM ATUALIZADA - X6531B-V631BEAFAHAIAJAKAMANANOP-U-OP-260314V1118\n/");
    expect(result.script).toContain("[GARANTIA:]\nEM GARANTIA\n/");
    expect(result.script).toContain("[REPARO:]\nCOMPONENTES SUBSTITUIDOS:\nLCD - SERIAL RETIRADO: OLD-1 - SERIAL INSTALADO: NEW-1\n/");
    expect(result.script).not.toContain("123456");
    expect(result.script?.split("\n/").length).toBeGreaterThan(7);
  });

  it("aplica a estrutura de computador e a regra especial de BIOS", () => {
    const result = generateTechnicalScript({ ...complete, modelo: "POSITIVO VISION C14 - N14JP9R", queixa: "Não inicia o sistema." }, [], catalog);
    expect(result.equipmentType).toBe("COMPUTADOR/NOTEBOOK");
    expect(result.script).toContain("[PROCEDIMENTOS REALIZADOS:]");
    expect(result.script).toContain("[VERSÃO DA BIOS:]\nV1.13.X\n/");
    expect(result.script).not.toContain("[VERSAO DA IMAGEM INSTALADA:]");
  });

  it("aplica NPI e a regra de reparo para Infinix HOT 11S com LCD em curto", () => {
    const result = generateTechnicalScript({ ...complete, modelo: "HOT 11S", diagnostico: "NPI. LCD EM CURTO." }, [], [{ modelo: "INFINIX HOT 11S", marca: "INFINIX", tipo: "IMAGEM", versao: "VERSAO-HOT11S", ativo: true }]);
    expect(result.script).toContain("[DIAGNOSTICO:]\nEQUIPAMENTO AVALIADO COMO NPI PELA ENGENHARIA DE SERVIÇOS.\n/");
    expect(result.script).toContain("[REPARO:]\nE NECESSÁRIA A TROCA DO LCD, FPC E BATERIA.\n/");
  });

  it("não inventa versão quando o modelo não consta na tabela", () => {
    const result = generateTechnicalScript({ ...complete, modelo: "MODELO NÃO CADASTRADO" }, [], catalog);
    expect(result.analysis).toContain("MODELO SEM IMAGEM CADASTRADA.");
    expect(result.script).toContain("IMAGEM ATUALIZADA - VERSAO NAO CADASTRADA (PENDENTE DE TABELA)");
  });

  it("usa a versão atual fornecida pela base a cada nova geração", () => {
    const updatedCatalog: CatalogEntry[] = [{ modelo: "INFINIX HOT 50I", marca: "INFINIX", tipo: "IMAGEM", versao: "VERSAO NOVA DA BASE", ativo: true }];
    const result = generateTechnicalScript(complete, [], updatedCatalog);
    expect(result.script).toContain("IMAGEM ATUALIZADA - VERSAO NOVA DA BASE");
    expect(result.script).not.toContain("X6531B-V631BEAFAHAIAJAKAMANANOP-U-OP-260314V1118");
  });

  it("lista múltiplas peças e preserva apenas os seriais realmente cadastrados", () => {
    const result = generateTechnicalScript(complete, [{ peca: "CONECTOR DE CARGA", codigo: "INTERNO" }, { peca: "PLACA PRINCIPAL", serialInstalada: "XYZ789" }], catalog);
    expect(result.script).toContain("COMPONENTES SUBSTITUIDOS:\nCONECTOR DE CARGA.\nPLACA PRINCIPAL - SERIAL INSTALADO: XYZ789");
    expect(result.script).not.toContain("SERIAL RETIRADO:");
    expect(result.script).not.toContain("INTERNO");
  });
});
