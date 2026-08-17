import { describe, expect, it } from "vitest";
import { attentionGroups, sortMyQueue, workAgeInDays } from "./callPriorities";

const now = new Date("2026-08-14T12:00:00Z");
const ago = (days: number) => new Date(now.getTime() - days * 86_400_000);

describe("prioridades de operação", () => {
  const calls = [
    { id: 1, status: "Zurich", dataEntrada: ago(3) },
    { id: 2, status: "Zurich", dataEntrada: ago(15) },
    { id: 3, status: "EM ANDAMENTO", dataEntrada: ago(9) },
    { id: 4, status: "EM ANDAMENTO", dataEntrada: ago(8) },
    { id: 5, status: "EM ANDAMENTO", dataEntrada: ago(29) },
    { id: 6, status: "EM ANDAMENTO", dataEntrada: ago(27) },
    { id: 7, status: "AGUARDANDO PP", dataEntrada: ago(9) },
  ];
  it("prioriza Zurich e não repete chamados nos grupos por dias", () => {
    const groups = attentionGroups(calls, now);
    expect(groups.zurich.map((call) => call.id)).toEqual([2, 1]);
    expect(groups.nearTen.map((call) => call.id)).toEqual([3, 4]);
    expect(groups.nearThirty.map((call) => call.id)).toEqual([5, 6]);
    expect([...groups.zurich, ...groups.nearTen, ...groups.nearThirty]).not.toContainEqual(expect.objectContaining({ id: 7 }));
  });
  it("ordena Minha Fila por mais antigos ou mais recentes sem mudar status", () => {
    expect(sortMyQueue(calls, "oldest", now).map((call) => call.id)).toEqual([5, 6, 3, 4]);
    expect(sortMyQueue(calls, "newest", now).map((call) => call.id)).toEqual([4, 3, 6, 5]);
  });

  it("mantém prioridade pelo recebimento mesmo quando o andamento começou depois", () => {
    const call = { id: 8, status: "EM ANDAMENTO", dataEntrada: ago(20), dataInicioAndamento: ago(1) };
    expect(attentionGroups([call], now).nearTen).toEqual([]);
    expect(workAgeInDays(call, now)).toBe(1);
    expect(sortMyQueue([call, { id: 9, status: "EM ANDAMENTO", dataEntrada: ago(8), dataInicioAndamento: ago(8) }], "oldest", now).map((item) => item.id)).toEqual([8, 9]);
  });
});
