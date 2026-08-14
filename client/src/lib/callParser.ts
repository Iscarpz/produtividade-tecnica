export type ParsedCall = { numeroOs: string; serial: string; modelo: string; queixa: string };

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[º°]/g, "o").replace(/\s+/g, " ").trim();
function valueAfter(text: string, labels: string[]) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const normalizedLabels = labels.map(normalize);
  const found = lines.find((line) => { const n = normalize(line); return normalizedLabels.some((label) => n.startsWith(label + ":") || n.startsWith(label + " -") || n.startsWith(label + " ")); });
  if (!found) return "";
  const separator = found.search(/[:：-]/);
  return (separator >= 0 ? found.slice(separator + 1) : found.replace(new RegExp(`^(${normalizedLabels.join("|")})`, "i"), "")).trim();
}
export function parseCallText(text: string): ParsedCall {
  const clean = text.replace(/\u00a0/g, " ").replace(/[|;]/g, "\n");
  return {
    numeroOs: valueAfter(clean, ["Número O.S.", "Numero O.S.", "Número OS", "Numero OS", "O.S.", "OS"]),
    serial: valueAfter(clean, ["Serial", "S/N", "SN", "Número de série"]),
    modelo: valueAfter(clean, ["Modelo", "Produto", "Descrição do produto"]),
    queixa: valueAfter(clean, ["Descrição", "Queixa", "Causa", "Defeito", "Sintoma"]),
  };
}
export function daysOpen(start: Date | string, end?: Date | string | null) {
  const from = new Date(start); const to = end ? new Date(end) : new Date();
  const startDay = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const endDay = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.max(1, Math.floor((endDay - startDay) / 86400000) + 1);
}
