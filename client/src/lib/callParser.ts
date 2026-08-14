export type ParsedCall = { numeroOs: string; serial: string; modelo: string; queixa: string };

const fold = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const compact = (value: string) => value.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/^[-–—]\s*/, "").trim();

function fieldValue(text: string, label: string, nextLabels: string[]) {
  const labels = [label, ...nextLabels].map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const match = text.match(new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[:：]?\\s*([\\s\\S]*?)(?=\\s+(?:${labels.slice(1).join("|")})\\s*[:：]?|$)`, "i"));
  return compact(match?.[1] || "");
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
  const normalized = text.replace(/[|;]/g, "\n").replace(/\r/g, "\n");
  const labels = ["Número O.S.", "Numero OS", "O.S.", "Abertura", "Serial", "S/N", "Situação", "Texto Breve", "SLA", "Data Limite", "Modelo", "Produto", "Código", "Material", "Garantia", "Contrato", "Cliente", "Telefone", "Causa", "Descrição", "Defeito", "Sintoma"];
  const next = (label: string) => labels.filter((item) => item !== label);
  const numeroOs = fieldValue(normalized, "Número O.S.", next("Número O.S.")) || fieldValue(normalized, "Numero OS", next("Numero OS")) || fieldValue(normalized, "O.S.", next("O.S."));
  const serial = fieldValue(normalized, "Serial", next("Serial")) || fieldValue(normalized, "S/N", next("S/N"));
  const modelo = fieldValue(normalized, "Modelo", next("Modelo")) || fieldValue(normalized, "Produto", next("Produto"));
  const cause = fieldValue(normalized, "Causa", next("Causa"));
  const description = fieldValue(normalized, "Descrição", next("Descrição").filter((item) => item !== "Sintoma")) || fieldValue(normalized, "Defeito", next("Defeito").filter((item) => item !== "Sintoma"));
  return { numeroOs, serial, modelo, queixa: cleanComplaint(description, cause) };
}

export function daysOpen(start: Date | string, end?: Date | string | null) {
  const from = new Date(start); const to = end ? new Date(end) : new Date();
  const startDay = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const endDay = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.max(1, Math.floor((endDay - startDay) / 86400000) + 1);
}
