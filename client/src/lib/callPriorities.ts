export type OpenCall = { id: number; status: string; prioridadeZurich?: boolean; dataEntrada: Date | string | number; dataInicioAndamento?: Date | string | number | null; dataFinalizacao?: Date | string | number | null };
export type QueueOrder = "all" | "oldest" | "newest";

export function callAgeInDays(call: OpenCall, now = new Date()) {
  return Math.max(0, Math.floor((now.getTime() - new Date(call.dataEntrada).getTime()) / 86_400_000));
}

export function workAgeInDays(call: OpenCall, now = new Date()) {
  if (!call.dataInicioAndamento) return null;
  return Math.max(0, Math.floor((now.getTime() - new Date(call.dataInicioAndamento).getTime()) / 86_400_000));
}

export function sortMyQueue<T extends OpenCall>(calls: T[], order: QueueOrder, now = new Date()) {
  const active = calls.filter((call) => call.status === "EM ANDAMENTO");
  if (order === "all") return active;
  return [...active].sort((a, b) => order === "newest" ? new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime() : callAgeInDays(b, now) - callAgeInDays(a, now));
}

export function attentionGroups<T extends OpenCall>(calls: T[], now = new Date()) {
  const byOldest = (a: T, b: T) => callAgeInDays(b, now) - callAgeInDays(a, now);
  const zurich = calls.filter((call) => call.status === "Zurich" && call.prioridadeZurich === true).sort(byOldest);
  const andamento = calls.filter((call) => call.status === "EM ANDAMENTO");
  return {
    zurich,
    nearTen: andamento.filter((call) => { const age = callAgeInDays(call, now); return age >= 7 && age < 10; }).sort(byOldest),
    nearThirty: andamento.filter((call) => { const age = callAgeInDays(call, now); return age >= 27 && age < 30; }).sort(byOldest),
  };
}
