export const VISUAL_INSPECTIONS = [
  "SEM SINAIS DE MAU USO OU DE ABERTURA PRÉVIA.",
  "MAU USO CONSTATADO - EQUIPAMENTO COM AVARIAS E/OU DANOS FÍSICOS",
  "CONSTATADO ABERTURA PRÉVIA POR PESSOAL NÃO AUTORIZADO",
] as const;

export type VisualInspection = (typeof VISUAL_INSPECTIONS)[number];
export type CatalogEntry = { modelo: string; marca: string; tipo: "IMAGEM" | "BIOS"; versao: string; ativo: boolean };
export type RepairForScript = { peca: string; codigo?: string | null; serialRetirada?: string | null; serialInstalada?: string | null; observacao?: string | null };
export type ScriptCall = { numeroOs: string; modelo: string; serial: string; queixa: string; diagnostico?: string | null; inspecaoVisual?: VisualInspection | null };
export type ScriptResult = { errors: string[]; analysis: string[]; script?: string; equipmentType: "SMARTPHONE/TABLET" | "COMPUTADOR/NOTEBOOK"; resolvedCatalog?: CatalogEntry };

const INFINIX_MODELS = ["SMART 6", "SMART 7", "SMART 8", "SMART 10", "HOT 11", "HOT 11S", "HOT 20I", "HOT 20 5G", "HOT 30", "HOT 30I", "HOT 40I", "HOT 50I", "NOTE 10 PRO NFC", "NOTE 10 PRO", "NOTE 12 PRO", "NOTE 30 5G", "NOTE 40 5G", "NOTE 50X", "GT 30 PRO", "ZERO 5G"];
const POSITIVO_MODELS = ["T3010D", "T3011D", "T307F", "T307G", "T780F", "T780G"];
const BIOS_MODELS = ["N14JP9R", "POSITIVO VISION C14 - N14JP9R", "POSITIVO VISION C4128A-14"];

export function normalizeSpace(value: string) { return value.trim().replace(/\s+/g, " ").toUpperCase(); }
export function normalizeModel(value: string) {
  const model = normalizeSpace(value);
  if (/\bTL10\b/.test(model) && !model.startsWith("VAIO")) return `VAIO ${model}`;
  if (/\bTL12\b/.test(model) && !model.startsWith("VAIO")) return `VAIO ${model}`;
  if (INFINIX_MODELS.some((item) => model.includes(item)) && !model.startsWith("INFINIX")) return `INFINIX ${model}`;
  if (POSITIVO_MODELS.some((item) => model.includes(item)) && !model.startsWith("POSITIVO")) return `POSITIVO ${model}`;
  return model;
}

export function isComputerNotebook(modelo: string) { return /\b(VAIO|VISION|N14JP9R|NOTEBOOK|DESKTOP|COMPUTADOR|C4128A|C14)\b/.test(normalizeModel(modelo)); }
export function isBiosModel(modelo: string) { const normalized = normalizeModel(modelo); return BIOS_MODELS.some((item) => normalized.includes(item)); }

export function resolveCatalog(modelo: string, catalog: CatalogEntry[]) {
  const normalized = normalizeModel(modelo);
  return catalog.filter((item) => item.ativo).sort((a, b) => normalizeModel(b.modelo).length - normalizeModel(a.modelo).length).find((item) => normalized.includes(normalizeModel(item.modelo)) || normalizeModel(item.modelo).includes(normalized));
}

export function warrantyForInspection(inspection?: VisualInspection | null) {
  return inspection === VISUAL_INSPECTIONS[0] ? "EM GARANTIA" : "ATENDIMENTO EM ORÇAMENTO - FORA DE GARANTIA";
}

export function buildRepairText(repairs: RepairForScript[], fallback?: string) {
  if (!repairs.length) return fallback || "REPARO NÃO INFORMADO.";
  const items = repairs.map((repair) => {
    const serials = [repair.serialRetirada && `SERIAL RETIRADO: ${repair.serialRetirada}`, repair.serialInstalada && `SERIAL INSTALADO: ${repair.serialInstalada}`].filter(Boolean);
    return `${repair.peca}${serials.length ? ` - ${serials.join(" - ")}` : "."}`;
  });
  return ["REALIZADA A TROCA DE:", ...items].join("\n");
}

function normalizeScriptValue(value: string) { return value.split("\n").map(normalizeSpace).join("\n"); }
function block(label: string, value: string) { return `[${label}:]\n${normalizeScriptValue(value)}\n/`; }
function automaticRepair(call: ScriptCall) {
  const complaint = normalizeSpace(call.queixa);
  const diagnosis = normalizeSpace(call.diagnostico || "");
  if (normalizeModel(call.modelo).includes("INFINIX HOT 11S") && (complaint.includes("REINICI") || diagnosis.includes("LCD") && diagnosis.includes("CURTO"))) return "E NECESSÁRIA A TROCA DO LCD, FPC E BATERIA.";
  if ((complaint.includes("LENTID") || complaint.includes("TRAVAMENTO") || complaint.includes("DESEMPENHO")) && !diagnosis.includes("HARDWARE")) return "ATUALIZAÇÃO DA IMAGEM.";
  return undefined;
}

export function generateTechnicalScript(call: ScriptCall, repairs: RepairForScript[], catalog: CatalogEntry[]): ScriptResult {
  const errors = [!call.modelo?.trim() && "Informe o modelo do equipamento.", !call.queixa?.trim() && "Informe a queixa formalizada.", !call.diagnostico?.trim() && "Informe o diagnóstico do equipamento.", !call.inspecaoVisual && "Selecione a inspeção visual/testes de hardware."].filter(Boolean) as string[];
  const equipmentType = isComputerNotebook(call.modelo) ? "COMPUTADOR/NOTEBOOK" : "SMARTPHONE/TABLET";
  const resolvedCatalog = resolveCatalog(call.modelo, catalog);
  const model = normalizeModel(call.modelo || "NÃO INFORMADO");
  const diagnosis = normalizeSpace(call.diagnostico || "NÃO INFORMADO");
  const npiDiagnosis = diagnosis.includes("NPI") ? "EQUIPAMENTO AVALIADO COMO NPI PELA ENGENHARIA DE SERVIÇOS." : diagnosis;
  const automatic = automaticRepair(call);
  const repair = buildRepairText(repairs, automatic);
  const inspection = call.inspecaoVisual || "NÃO INFORMADA";
  const usesBios = isBiosModel(call.modelo) || resolvedCatalog?.tipo === "BIOS";
  const version = resolvedCatalog?.versao || (usesBios ? "VERSÃO DA BIOS NÃO CADASTRADA (PENDENTE DE TABELA)" : "IMAGEM ATUALIZADA - VERSAO NAO CADASTRADA (PENDENTE DE TABELA)");
  const versionLabel = usesBios ? "VERSÃO DA BIOS" : "VERSAO DA IMAGEM INSTALADA";
  const imageValue = usesBios ? version : resolvedCatalog ? `IMAGEM ATUALIZADA - ${version}` : version;
  const analysis = [
    `CHAMADO: ${call.numeroOs || "NÃO INFORMADO"}.`,
    `TIPO IDENTIFICADO: ${equipmentType}.`,
    `MODELO NORMALIZADO: ${model}.`,
    `SERIAL DO EQUIPAMENTO: ${call.serial || "NÃO INFORMADO"}.`,
    `GARANTIA: ${warrantyForInspection(call.inspecaoVisual)}.`,
    resolvedCatalog ? `${usesBios ? "BIOS" : "IMAGEM"} RESOLVIDA PELA TABELA: ${normalizeSpace(resolvedCatalog.versao)}.` : `MODELO SEM ${usesBios ? "BIOS" : "IMAGEM"} CADASTRADA.`,
    repairs.length ? `${repairs.length} REGISTRO(S) DE REPARO INCORPORADO(S) AO SCRIPT.` : automatic ? "REGRA TÉCNICA AUTOMÁTICA APLICADA AO REPARO." : "NENHUM REPARO/PEÇA REGISTRADO.",
  ].map(normalizeSpace);
  if (errors.length) return { errors, analysis, equipmentType, resolvedCatalog };

  const common = [
    block("MODELO", model),
    block("QUEIXA", call.queixa),
    block("DIAGNOSTICO", npiDiagnosis),
    block("INSPECAO VISUAL/TESTES DE HARDWARE", inspection),
    block("REPARO", repair),
  ];
  const tail = equipmentType === "COMPUTADOR/NOTEBOOK"
    ? [block("PROCEDIMENTOS REALIZADOS", "CONFIGURACAO E ATUALIZACAO DA BIOS PARA A ULTIMA VERSAO DISPONIVEL, ATUALIZACAO DA IMAGEM QUANDO APLICAVEL E EXECUCAO DE TESTES DE HARDWARE E SISTEMA."), block(versionLabel, imageValue), block("GARANTIA", warrantyForInspection(call.inspecaoVisual)), block("ACOES PREVENTIVAS", "REALIZADA LIMPEZA DE CONTATOS, VERIFICACAO DE CONEXOES INTERNAS E TESTES FUNCIONAIS."), block("AVALIACAO POS-REPARO", "EQUIPAMENTO LIGANDO, CARREGANDO, INICIALIZANDO SISTEMA E FUNCIONANDO DENTRO DOS PADROES ESTABELECIDOS PARA O PRODUTO.")]
    : [block(versionLabel, imageValue), block("GARANTIA", warrantyForInspection(call.inspecaoVisual)), block("ACOES PREVENTIVAS", "REALIZADA LIMPEZA DE CONTATOS.\nEXECUTADOS TESTES DE CAMERA, AUDIO, TOUCHSCREEN, CONEXOES, SENSORES E DEMAIS FUNCOES ATRAVES DAS FERRAMENTAS NATIVAS DO EQUIPAMENTO.\nEFETUADOS TESTES DE ESTABILIDADE E ESTRESSE UTILIZANDO STABILITY TEST (V2.5) E STRESS TEST (V9.4)."), block("AVALIACAO POS-REPARO", "EQUIPAMENTO LIGANDO, CARREGANDO E FUNCIONANDO DENTRO DOS PADROES ESTABELECIDOS PARA O PRODUTO.")];
  return { errors, analysis, equipmentType, resolvedCatalog, script: [...common, ...tail].join("\n") };
}
