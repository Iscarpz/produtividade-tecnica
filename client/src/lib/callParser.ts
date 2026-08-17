export type ParsedCall = { numeroOs: string; serial: string; modelo: string; queixa: string };

const compact = (value: string) => value.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/^[-–—]\s*/, "").trim();

const FIELD_PATTERNS = {
  numeroOs: "(?:n[uú]mero|n[ºo])\\s*o\\.?\\s*s\\.?",
  serial: "(?:serial|s\\s*\\/\\s*n)",
  modelo: "(?:modelo|produto)",
  abertura: "abertura",
  situacao: "situa[cç][aã]o",
  textoBreve: "texto\\s+breve",
  sla: "sla",
  dataLimite: "data\\s+limite",
  codigo: "c[oó]digo",
  material: "material",
  garantia: "garantia",
  contrato: "contrato",
  cliente: "cliente",
  telefone: "telefone",
  causa: "causa",
  descricao: "descri[cç][aã]o",
  defeito: "defeito",
  sintoma: "sintoma",
} as const;

const ALL_FIELD_PATTERNS = Object.values(FIELD_PATTERNS).join("|");

function fieldValue(text: string, pattern: string) {
  const match = text.match(new RegExp(`(?:^|\\s)${pattern}\\s*[:：-]\\s*([\\s\\S]*?)(?=\\s+(?:${ALL_FIELD_PATTERNS})\\s*[:：-]|$)`, "i"));
  return compact(match?.[1] || "");
}

function requiredNumber(text: string) {
  const match = text.match(new RegExp(`(?:^|\\s)${FIELD_PATTERNS.numeroOs}\\s*[:：-]?\\s*([0-9]+)`, "i"));
  return match?.[1] || "";
}

function cleanComplaint(description: string, cause: string) {
  let result = compact(description);
  const symptom = result.match(/(?:^|\s)Sintoma\s*[:：-]\s*([\s\S]*)$/i);
  if (symptom?.[1]) result = symptom[1];
  if (cause) result = result.replace(new RegExp(`^${cause.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "");
  result = result.replace(/^DESLIGANDO\s+/i, "");
  return compact(result);
}

export function parseCallText(text: string): ParsedCall {
  const normalized = text.replace(/\u00a0/g, " ").replace(/\r\n?/g, "\n");
  const numeroOs = requiredNumber(normalized);
  const serial = fieldValue(normalized, FIELD_PATTERNS.serial);
  const modelo = fieldValue(normalized, FIELD_PATTERNS.modelo);
  const cause = fieldValue(normalized, FIELD_PATTERNS.causa);
  const description = fieldValue(normalized, FIELD_PATTERNS.sintoma)
    || fieldValue(normalized, FIELD_PATTERNS.descricao)
    || fieldValue(normalized, FIELD_PATTERNS.defeito);
  return { numeroOs, serial, modelo, queixa: cleanComplaint(description, cause) };
}

export function daysOpen(start: Date | string, end?: Date | string | null) {
  const from = new Date(start); const to = end ? new Date(end) : new Date();
  const startDay = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const endDay = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.max(1, Math.floor((endDay - startDay) / 86400000) + 1);
}
