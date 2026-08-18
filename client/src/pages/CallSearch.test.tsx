// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({ list: vi.fn(), transition: vi.fn(), invalidateCalls: vi.fn(), invalidateProductivity: vi.fn() }));
const setLocation = vi.fn();
const rows = [
  { id: 12, numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Desliga apps sozinho", status: "EM ANDAMENTO", dataEntrada: new Date("2026-08-14"), dataFinalizacao: null },
  { id: 13, numeroOs: "60006454346", serial: "PP123", modelo: "Modelo PP", queixa: "Aguarda peça", status: "AGUARDANDO PP", dataEntrada: new Date("2026-08-13"), dataFinalizacao: null },
  { id: 14, numeroOs: "60006454347", serial: "DONE123", modelo: "Modelo finalizado", queixa: "Concluído", status: "FINALIZADO", dataEntrada: new Date("2026-08-12"), dataFinalizacao: new Date("2026-08-14") },
  { id: 15, numeroOs: "60006454348", serial: "RECEIVED123", modelo: "Modelo recebido", queixa: "Aguardando bancada", status: "RECEBIDO", dataEntrada: new Date("2026-08-15"), dataFinalizacao: null },
];

vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ calls: { list: { invalidate: mocked.invalidateCalls } }, productivity: { range: { invalidate: mocked.invalidateProductivity } } }), calls: { list: { useQuery: mocked.list }, transition: { useMutation: () => ({ mutate: mocked.transition, isPending: false, variables: null }) } } } }));
vi.mock("wouter", () => ({ useLocation: () => ["/chamados", setLocation] }));

import CallSearch, { STATUS_FILTERS } from "./CallSearch";

describe("CallSearch UI", () => {
  afterEach(cleanup);
  beforeEach(() => { setLocation.mockClear(); mocked.transition.mockClear(); mocked.invalidateCalls.mockClear(); mocked.invalidateProductivity.mockClear(); mocked.list.mockImplementation(() => ({ data: rows, isLoading: false })); });

  it("mostra todos por padrão e combina filtro de status com busca por serial", () => {
    render(<CallSearch />);
    expect(mocked.list).toHaveBeenLastCalledWith(undefined, expect.any(Object));
    expect(screen.getByRole("button", { name: "Todos, 4 chamados" })).toHaveTextContent("4");
    expect(screen.getByRole("button", { name: "Em andamento, 1 chamados" })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "PP, 1 chamados" })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Finalizados, 1 chamados" })).toHaveTextContent("1");
    expect(screen.getByText("Chamado 60006454345")).toBeInTheDocument();
    expect(screen.getByText("Chamado 60006454346")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "PP, 1 chamados" }));
    expect(mocked.list).toHaveBeenLastCalledWith(undefined, expect.any(Object));
    expect(screen.queryByText("Chamado 60006454345")).not.toBeInTheDocument();
    expect(screen.getByText("Chamado 60006454346")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Pesquisar por número do chamado ou serial"), { target: { value: "PP123" } });
    expect(screen.getByRole("button", { name: "Todos, 4 chamados" })).toHaveTextContent("4");
    expect(screen.getByText("Chamado 60006454346")).toBeInTheDocument();
  });

  it("abre os detalhes ao selecionar o resultado filtrado", () => {
    render(<CallSearch />);
    fireEvent.click(screen.getByText("Chamado 60006454345"));
    expect(setLocation).toHaveBeenCalledWith("/?call=12&from=chamados");
  });

  it("permite colocar um chamado recebido em andamento sem abrir a ficha", () => {
    render(<CallSearch />);
    fireEvent.click(screen.getByRole("button", { name: "Colocar chamado 60006454348 em andamento" }));
    expect(mocked.transition).toHaveBeenCalledWith({ id: 15, action: "Iniciar andamento" });
    expect(setLocation).not.toHaveBeenCalled();
  });

  it("expõe o filtro Finalizados mantendo os badges de quantidade neutros", () => {
    expect(STATUS_FILTERS).toEqual(expect.arrayContaining([expect.objectContaining({ value: "FINALIZADO", label: "Finalizados" })]));
  });
});
