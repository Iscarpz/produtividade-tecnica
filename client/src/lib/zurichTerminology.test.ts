import { describe, expect, it } from "vitest";
import { menuItems } from "@/components/DashboardLayout";
import { queues } from "@/pages/QueuePage";
import { attentionGroups } from "./callPriorities";
import { OPEN_STATUSES, PRODUCTIVITY_EVENTS } from "./productivityRules";

describe("terminologia Zurich", () => {
  it("mantém Zurich exatamente no menu, rota, filtros e eventos operacionais", () => {
    expect(menuItems.find((item) => item.path === "/fila/zurich")?.label).toBe("Zurich");
    expect(queues.zurich).toMatchObject({ status: "Zurich", title: "Zurich" });
    expect(OPEN_STATUSES).toContain("Zurich");
    expect(PRODUCTIVITY_EVENTS).toContain("ENVIADO_Zurich");
    expect(OPEN_STATUSES).not.toContain("ZURICH");
  });

  it("separa somente chamados Zurich aprovados que já retornaram ao Reparo no grupo de atenção necessário", () => {
    const groups = attentionGroups([{ id: 1, status: "EM ANDAMENTO", prioridadeZurich: true, dataEntrada: new Date("2026-08-01T00:00:00Z") }, { id: 2, status: "Zurich", prioridadeZurich: false, dataEntrada: new Date("2026-08-01T00:00:00Z") }], new Date("2026-08-14T00:00:00Z"));
    expect(groups.zurich.map((call) => call.id)).toEqual([1]);
  });
});
