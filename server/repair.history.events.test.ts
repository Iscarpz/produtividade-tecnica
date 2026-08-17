import { describe, expect, it } from "vitest";
import { buildRepairDeletedHistoryEvent, buildRepairUpdatedHistoryEvent } from "./db";

describe("histórico de peças editadas e excluídas", () => {
  it("registra os campos efetivamente alterados sem duplicar a peça", () => {
    expect(buildRepairUpdatedHistoryEvent(7, 22, { peca: "Display", codigo: "DISP-50", observacao: null }, { peca: "Display", codigo: "DISP-51", observacao: "Revisado" }, new Date("2026-08-17T13:00:00Z"))).toMatchObject({ chamadoId: 22, userId: 7, evento: "Peça atualizada: Display", observacao: "Campos alterados: código, observação" });
  });

  it("registra a exclusão com os detalhes disponíveis do registro removido", () => {
    expect(buildRepairDeletedHistoryEvent(7, 22, { peca: "Display", codigo: "DISP-51", serialInstalada: "SN-NEW" }, new Date("2026-08-17T13:00:00Z"))).toMatchObject({ chamadoId: 22, userId: 7, evento: "Peça excluída: Display", observacao: "Código: DISP-51 · S/N instalada: SN-NEW" });
  });
});
