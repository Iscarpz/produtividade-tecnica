export type OpenCall = { id: number; status: string; dataEntrada: Date | string | number; dataFinalizacao?: Date | string | number | null };
export type QueueOrder = "all" | "oldest" | "newest";

export function callAgeInDays(call: OpenCall, now = new Date()) {
  const end = call.dataFinalizacao ? new Date(call.dataFinalizacao) : now;
  return Math.max(0, Math.floor((end.getTime() - new Date(call.dataEntrada).getTime()) / 86_400_000));
}

export function sortMyQueue<T extends OpenCall>(calls: T[], order: QueueOrder, now = new Date()) {
  const active = calls.filter((call) => call.status === "EM ANDAMENTO");
  if (order === "all") return active;
  return [...active].sort((a, b) => order === "newest" ? new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime() : callAgeInDays(b, now) - callAgeInDays(a, now));
}

export function attentionGroups<T extends OpenCall>(calls: T[], now = new Date()) {
  const byOldest = (a: T, b: T) => callAgeInDays(b, now) - callAgeInDays(a, now);
  const zurich = calls.filter((call) => call.status === "ZURICH").sort(byOldest);
  const andamento = calls.filter((call) => call.status === "EM ANDAMENTO");
  return {
    zurich,
    nearTen: andamento.filter((call) => { const age = callAgeInDays(call, now); return age >= 7 && age < 10; }).sort(byOldest),
    nearThirty: andamento.filter((call) => { const age = callAgeInDays(call, now); return age >= 27 && age < 30; }).sort(byOldest),
  };
}
