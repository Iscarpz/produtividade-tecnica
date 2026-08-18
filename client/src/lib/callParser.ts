import { normalizeModelName } from "@shared/modelNormalization";

export { normalizeModelName };
export type ParsedCall = { numeroOs: string; serial: string; modelo: string; queixa: string; garantia?: string; causa?: string };

const compact = (value: string) => value.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/^[-–—]\s*/, "").trim();

const FIELD_PATTERNS = {
  numeroOs: "(?:chamado|n[uú]mero|n[ºo])\\s*(?:o\\.?\\s*s\\.?)?",
  serial: "(?:serial|s\\s*\\/\\s*n)",
  modelo: "(?:marca\\s*\\/\\s*modelo|modelo|produto)",
  abertura: "abertura",
  situacao: "situa[cç][aã]o",
  textoBreve: "texto\\s+breve",
  sla: "sla",
  dataLimite: "data\\s+limite",
  codigo: "c[oó]digo",
  material: "material",
  garantia: "garantia",
  contrato: "contrato",
  cliente: "(?:cliente|consumidor)",
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
  const labeledCall = text.match(/(?:^|\s)chamado\s*[:：-]?\s*([0-9]{5,})/i);
  if (labeledCall?.[1]) return labeledCall[1];
  const fallback = text.match(new RegExp(`(?:^|\\s)${FIELD_PATTERNS.numeroOs}\\s*[:：-]?\\s*([0-9]{5,})`, "i"));
  return fallback?.[1] || "";
}

function extractSerial(text: string) {
  const source = text.replace(new RegExp(`((?:^|\\s)${FIELD_PATTERNS.serial}\\s*[:：-]\\s*)garantia\\s*[:：-]\\s*`, "i"), "$1");
  const raw = fieldValue(source, FIELD_PATTERNS.serial).replace(/\b(?:em\s+garantia|fora\s+de\s+garantia|garantia)\b/gi, " ");
  return raw.match(/\b[A-Za-z0-9][A-Za-z0-9-]{4,}\b/)?.[0] || "";
}

function extractWarranty(text: string) {
  const raw = fieldValue(text, FIELD_PATTERNS.garantia);
  const source = `${raw} ${text}`.toUpperCase();
  if (/\bFORA\s+DE\s+GARANTIA\b/.test(source)) return "FORA DE GARANTIA";
  if (/\bEM\s+GARANTIA\b/.test(source)) return "EM GARANTIA";
  return /\bGARANTIA\b/.test(source) ? "GARANTIA" : "";
}

function cleanComplaint(description: string) {
  return compact(description);
}

export function parseCallText(text: string): ParsedCall {
  const normalized = text.replace(/\u00a0/g, " ").replace(/\r\n?/g, "\n");
  const numeroOs = requiredNumber(normalized);
  const serial = extractSerial(normalized);
  const modelo = normalizeModelName(fieldValue(normalized, FIELD_PATTERNS.modelo));
  const causa = compact(fieldValue(normalized, FIELD_PATTERNS.causa));
  const description = fieldValue(normalized, FIELD_PATTERNS.sintoma)
    || fieldValue(normalized, FIELD_PATTERNS.descricao)
    || fieldValue(normalized, FIELD_PATTERNS.defeito);
  const garantia = extractWarranty(normalized);
  return { numeroOs, serial, modelo, queixa: cleanComplaint(description), ...(garantia ? { garantia } : {}), ...(causa ? { causa } : {}) };
}

export function daysOpen(start: Date | string, end?: Date | string | null) {
  const from = new Date(start); const to = end ? new Date(end) : new Date();
  const startDay = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const endDay = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.max(0, Math.floor((endDay - startDay) / 86400000));
}
