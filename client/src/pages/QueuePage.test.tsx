/** @vitest-environment jsdom */
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({ list: vi.fn(() => ({ data: [{ id: 9, numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I", queixa: "Desliga sozinho" }], isLoading: false })) }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ calls: { list: { invalidate: vi.fn() }, listTeam: { invalidate: vi.fn() }, detail: { invalidate: vi.fn() } }, productivity: { range: { invalidate: vi.fn() }, teamRange: { invalidate: vi.fn() } } }), calls: { list: { useQuery: mocked.list } } } }));
vi.mock("@/components/CallDetail", () => ({ CallDetail: ({ id }: { id: number }) => <div>Detalhe {id}</div> }));

import QueuePage from "./QueuePage";

afterEach(cleanup);

describe("QueuePage", () => {
  it("consulta o status atual, atualiza a busca por serial ou número do chamado e abre o detalhe", async () => {
    render(<QueuePage queue="pp"/>);
    expect(mocked.list).toHaveBeenCalledWith(expect.objectContaining({ status: "AGUARDANDO PP", search: undefined, from: expect.any(Date), to: expect.any(Date) }), expect.any(Object));
    fireEvent.change(screen.getByPlaceholderText("Buscar chamado por número ou serial..."), { target: { value: "5A538SY82" } });
    await waitFor(() => expect(mocked.list).toHaveBeenLastCalledWith(expect.objectContaining({ status: "AGUARDANDO PP", search: "5A538SY82", from: expect.any(Date), to: expect.any(Date) }), expect.any(Object)));
    expect(screen.getByText("Chamado 60006454345")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Buscar chamado por número ou serial..."), { target: { value: "60006454345" } });
    await waitFor(() => expect(mocked.list).toHaveBeenLastCalledWith(expect.objectContaining({ status: "AGUARDANDO PP", search: "60006454345", from: expect.any(Date), to: expect.any(Date) }), expect.any(Object)));
    fireEvent.click(screen.getByText("Chamado 60006454345"));
    expect(screen.getByText("Detalhe 9")).toBeInTheDocument();
  });

  it("aplica o período selecionado somente à categoria visualizada", async () => {
    render(<QueuePage queue="em-andamento"/>);
    for (const label of ["Hoje", "Esta semana", "Este mês", "Este ano"]) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      await waitFor(() => expect(mocked.list).toHaveBeenLastCalledWith(expect.objectContaining({ status: "EM ANDAMENTO", from: expect.any(Date), to: expect.any(Date) }), expect.any(Object)));
    }

    fireEvent.click(screen.getByRole("button", { name: "Personalizado" }));
    fireEvent.change(screen.getByLabelText("Data inicial"), { target: { value: "2026-08-10" } });
    fireEvent.change(screen.getByLabelText("Data final"), { target: { value: "2026-08-18" } });
    await waitFor(() => expect(mocked.list).toHaveBeenLastCalledWith(expect.objectContaining({ status: "EM ANDAMENTO", from: new Date("2026-08-10T00:00:00"), to: new Date("2026-08-18T23:59:59") }), expect.any(Object)));
  });
});
