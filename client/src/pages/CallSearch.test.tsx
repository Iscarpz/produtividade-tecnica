// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({ list: vi.fn() }));
const setLocation = vi.fn();
const rows = [
  { id: 12, numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Desliga apps sozinho", status: "EM ANDAMENTO", dataEntrada: new Date("2026-08-14"), dataFinalizacao: null },
  { id: 13, numeroOs: "60006454346", serial: "PP123", modelo: "Modelo PP", queixa: "Aguarda peça", status: "AGUARDANDO PP", dataEntrada: new Date("2026-08-13"), dataFinalizacao: null },
];
vi.mock("@/lib/trpc", () => ({ trpc: { calls: { list: { useQuery: mocked.list } } } }));
vi.mock("wouter", () => ({ useLocation: () => ["/chamados", setLocation] }));

import CallSearch from "./CallSearch";

describe("CallSearch UI", () => {
  afterEach(cleanup);
  beforeEach(() => { setLocation.mockClear(); mocked.list.mockImplementation(() => ({ data: rows, isLoading: false })); });
  it("mostra todos por padrão e combina filtro de status com busca por serial", () => {
    render(<CallSearch />);
    expect(mocked.list).toHaveBeenLastCalledWith(undefined, expect.any(Object));
    expect(screen.getByRole("button", { name: "Todos, 2 chamados" })).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: "Em andamento, 1 chamados" })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "PP, 1 chamados" })).toHaveTextContent("1");
    expect(screen.getByText("Chamado 60006454345")).toBeInTheDocument();
    expect(screen.getByText("Chamado 60006454346")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PP, 1 chamados" }));
    expect(mocked.list).toHaveBeenLastCalledWith(undefined, expect.any(Object));
    expect(screen.queryByText("Chamado 60006454345")).not.toBeInTheDocument();
    expect(screen.getByText("Chamado 60006454346")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Pesquisar por número do chamado ou serial"), { target: { value: "PP123" } });
    expect(screen.getByRole("button", { name: "Todos, 2 chamados" })).toHaveTextContent("2");
    expect(screen.getByText("Chamado 60006454346")).toBeInTheDocument();
  });

  it("abre os detalhes ao selecionar o resultado filtrado", () => {
    render(<CallSearch />);
    fireEvent.click(screen.getByText("Chamado 60006454345"));
    expect(setLocation).toHaveBeenCalledWith("/?call=12");
  });
});
