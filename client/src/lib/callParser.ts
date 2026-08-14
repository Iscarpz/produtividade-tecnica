export type ParsedCall = { numeroOs: string; serial: string; modelo: string; queixa: string };

function valueAfter(text: string, label: string) {
  const line = text.split(/\r?\n/).find((item) => item.trim().toLowerCase().startsWith(label.toLowerCase()));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}
export function parseCallText(text: string): ParsedCall {
  const description = valueAfter(text, "Descrição") || valueAfter(text, "Queixa") || valueAfter(text, "Causa");
  return {
    numeroOs: valueAfter(text, "Número O.S.") || valueAfter(text, "Numero O.S.") || valueAfter(text, "O.S."),
    serial: valueAfter(text, "Serial"),
    modelo: valueAfter(text, "Modelo"),
    queixa: description,
  };
}
export function daysOpen(start: Date | string, end?: Date | string | null) {
  const from = new Date(start); const to = end ? new Date(end) : new Date();
  const startDay = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const endDay = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.max(1, Math.floor((endDay - startDay) / 86400000) + 1);
}
