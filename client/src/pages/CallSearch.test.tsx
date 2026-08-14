/** @vitest-environment jsdom */
import React from "react";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setLocation = vi.fn();
const rows = [{ id: 12, numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Desliga apps sozinho", status: "EM ANDAMENTO", dataEntrada: new Date("2026-08-14"), dataFinalizacao: null }];
vi.mock("@/lib/trpc", () => ({ trpc: { calls: { list: { useQuery: () => ({ data: rows, isLoading: false }) } } } }));
vi.mock("wouter", () => ({ useLocation: () => ["/chamados", setLocation] }));

import CallSearch from "./CallSearch";

describe("CallSearch UI", () => {
  beforeEach(() => setLocation.mockClear());
  it("mostra resultado ao pesquisar e abre os detalhes ao selecionar", () => {
    render(<CallSearch />);
    const input = screen.getByPlaceholderText("Pesquisar por número do chamado ou serial");
    fireEvent.change(input, { target: { value: "5A538SY82" } });
    expect(screen.getByText("Chamado 60006454345")).toBeInTheDocument();
    expect(screen.getByText("com o técnico")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Chamado 60006454345"));
    expect(setLocation).toHaveBeenCalledWith("/?call=12");
  });
});
