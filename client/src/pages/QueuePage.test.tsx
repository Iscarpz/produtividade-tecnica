/** @vitest-environment jsdom */
import React from "react";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({ list: vi.fn(() => ({ data: [{ id: 9, numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I", queixa: "Desliga sozinho" }], isLoading: false })) }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ calls: { list: { invalidate: vi.fn() }, detail: { invalidate: vi.fn() } }, productivity: { range: { invalidate: vi.fn() } } }), calls: { list: { useQuery: mocked.list } } } }));
vi.mock("@/components/CallDetail", () => ({ CallDetail: ({ id }: { id: number }) => <div>Detalhe {id}</div> }));

import QueuePage from "./QueuePage";

describe("QueuePage", () => {
  it("consulta o status atual, atualiza a busca por serial ou número do chamado e abre o detalhe", async () => {
    render(<QueuePage queue="pp"/>);
    expect(mocked.list).toHaveBeenCalledWith({ status: "AGUARDANDO PP", search: undefined }, expect.any(Object));
    fireEvent.change(screen.getByPlaceholderText("Buscar chamado por número ou serial..."), { target: { value: "5A538SY82" } });
    await waitFor(() => expect(mocked.list).toHaveBeenLastCalledWith({ status: "AGUARDANDO PP", search: "5A538SY82" }, expect.any(Object)));
    expect(screen.getByText("Chamado 60006454345")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Buscar chamado por número ou serial..."), { target: { value: "60006454345" } });
    await waitFor(() => expect(mocked.list).toHaveBeenLastCalledWith({ status: "AGUARDANDO PP", search: "60006454345" }, expect.any(Object)));
    fireEvent.click(screen.getByText("Chamado 60006454345"));
    expect(screen.getByText("Detalhe 9")).toBeInTheDocument();
  });
});
