import { describe, expect, it } from "vitest";
import { buildRepairHistoryDetails } from "./db";

describe("histórico de reparos", () => {
  it("monta os detalhes da intervenção para a timeline", () => {
    expect(buildRepairHistoryDetails({ codigo: "DISP-50", serialRetirada: "OLD-1", serialInstalada: "NEW-1", observacao: "Display substituído" })).toBe("Código: DISP-50 · S/N retirada: OLD-1 · S/N instalada: NEW-1 · Display substituído");
  });
});
