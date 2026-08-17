// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({
  close: vi.fn(),
  refresh: vi.fn(),
  setLocation: vi.fn(),
  detailQuery: vi.fn(),
  invalidate: vi.fn(),
  transitionMutate: vi.fn(),
  updateRepairMutate: vi.fn(),
  deleteRepairMutate: vi.fn(),
  updateTechnicalMutate: vi.fn(),
  scriptState: { data: { errors: ["Informe o diagnóstico do equipamento."], analysis: ["MODELO NORMALIZADO: MODELO TESTE."], equipmentType: "SMARTPHONE/TABLET" }, isLoading: false, isError: false } as any,
  deleteSuccess: null as null | (() => Promise<void>),
  queryState: { data: { call: { id: 12, numeroOs: "60006454345", modelo: "Modelo teste", serial: "ABC123", queixa: "Sem imagem", status: "EM ANDAMENTO", dataEntrada: new Date("2026-08-14T00:00:00Z"), updatedAt: new Date("2026-08-14T00:00:00Z") }, repairs: [], history: [] } as any, isLoading: false, isError: false },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      calls: { list: { invalidate: mocked.invalidate }, detail: { invalidate: mocked.invalidate }, generateScript: { invalidate: mocked.invalidate } },
      productivity: { range: { invalidate: mocked.invalidate } },
      historical: { troca: { invalidate: mocked.invalidate }, recusado: { invalidate: mocked.invalidate } },
    }),
    calls: {
      detail: { useQuery: (...args: unknown[]) => { mocked.detailQuery(...args); return mocked.queryState; } },
      generateScript: { useQuery: () => mocked.scriptState },
      transition: { useMutation: () => ({ isPending: false, mutate: mocked.transitionMutate }) },
      updateData: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      updateTechnicalData: { useMutation: () => ({ isPending: false, mutate: mocked.updateTechnicalMutate }) },
      addRepair: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      updateRepair: { useMutation: () => ({ isPending: false, mutate: mocked.updateRepairMutate }) },
      deleteRepair: { useMutation: () => ({ isPending: false, mutate: mocked.deleteRepairMutate }) },
      delete: { useMutation: ({ onSuccess }: { onSuccess: () => Promise<void> }) => { mocked.deleteSuccess = onSuccess; return { isPending: false, mutate: () => onSuccess() }; } },
    },
  },
}));
vi.mock("@trpc/react-query", () => ({ getQueryKey: () => ["calls", "detail", { id: 12 }] }));
vi.mock("wouter", () => ({ useLocation: () => ["/", mocked.setLocation] }));

import { CallDetail } from "./CallDetail";

function renderDetail() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const cancelQueries = vi.spyOn(queryClient, "cancelQueries");
  const removeQueries = vi.spyOn(queryClient, "removeQueries");
  render(<QueryClientProvider client={queryClient}><CallDetail id={12} onClose={mocked.close} onRefresh={mocked.refresh}/></QueryClientProvider>);
  return { cancelQueries, removeQueries };
}

afterEach(() => {
  cleanup();
  mocked.close.mockReset();
  mocked.refresh.mockReset();
  mocked.setLocation.mockReset();
  mocked.detailQuery.mockReset();
  mocked.invalidate.mockReset();
  mocked.transitionMutate.mockReset();
  mocked.updateRepairMutate.mockReset();
  mocked.deleteRepairMutate.mockReset();
  mocked.updateTechnicalMutate.mockReset();
  mocked.deleteSuccess = null;
  mocked.scriptState = { data: { errors: ["Informe o diagnóstico do equipamento."], analysis: ["MODELO NORMALIZADO: MODELO TESTE."], equipmentType: "SMARTPHONE/TABLET" }, isLoading: false, isError: false };
  mocked.queryState = { data: { call: { id: 12, numeroOs: "60006454345", modelo: "Modelo teste", serial: "ABC123", queixa: "Sem imagem", status: "EM ANDAMENTO", dataEntrada: new Date("2026-08-14T00:00:00Z"), updatedAt: new Date("2026-08-14T00:00:00Z") }, repairs: [], history: [] }, isLoading: false, isError: false };
});

describe("CallDetail — fluxo de exclusão", () => {
  it("fecha a ficha e remove a query de detalhes antes de atualizar as listas", async () => {
    const { cancelQueries, removeQueries } = renderDetail();
    fireEvent.click(screen.getByRole("button", { name: /excluir chamado/i }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir permanentemente" }));

    await waitFor(() => expect(mocked.close).toHaveBeenCalledTimes(1));
    expect(cancelQueries).toHaveBeenCalledWith({ queryKey: ["calls", "detail", { id: 12 }], exact: true });
    expect(removeQueries).toHaveBeenCalledWith({ queryKey: ["calls", "detail", { id: 12 }], exact: true });
    expect(mocked.detailQuery).toHaveBeenLastCalledWith({ id: 12 }, { enabled: false, retry: false });
    expect(mocked.invalidate).toHaveBeenCalled();
  });

  it("mostra o estado de chamado inexistente e retorna à busca sem erro de dados indefinidos", () => {
    mocked.queryState = { data: undefined, isLoading: false, isError: true };
    renderDetail();

    expect(screen.getByRole("heading", { name: "Chamado não encontrado" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Voltar para Chamados" }));
    expect(mocked.close).toHaveBeenCalledTimes(1);
    expect(mocked.setLocation).toHaveBeenCalledWith("/chamados");
  });
});

describe("CallDetail — laudo e peças", () => {
  it.each([
    ["Enviar para Orçamento", "NÃO"],
    ["Enviar para Zurich", "NÃO"],
  ])("pergunta sobre laudo e mantém a transição normal para %s ao escolher %s", (action) => {
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: action }));
    expect(screen.getByRole("heading", { name: "Necessário gerar um laudo?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "NÃO" }));
    expect(mocked.transitionMutate).toHaveBeenCalledWith({ id: 12, action });
  });

  it.each([
    ["Enviar para Orçamento"],
    ["Enviar para Zurich"],
  ])("abre o Laudo Creator sem mover o chamado para %s ao escolher SIM", (action) => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: action }));
    fireEvent.click(screen.getByRole("button", { name: "SIM" }));
    expect(open).toHaveBeenCalledWith("https://laudoatppr.base44.app/", "_blank", "noopener,noreferrer");
    expect(mocked.transitionMutate).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it("edita a mesma peça com os valores carregados sem acionar a criação de outro registro", () => {
    mocked.queryState = { data: { call: { id: 12, numeroOs: "60006454345", modelo: "Modelo teste", serial: "ABC123", queixa: "Sem imagem", status: "EM ANDAMENTO", dataEntrada: new Date("2026-08-14T00:00:00Z"), updatedAt: new Date("2026-08-14T00:00:00Z") }, repairs: [{ id: 44, peca: "Display", codigo: "DISP-50", serialRetirada: "OLD", serialInstalada: "NEW", observacao: "Original" }], history: [] } as any, isLoading: false, isError: false };
    renderDetail();
    fireEvent.click(screen.getAllByRole("button", { name: "Editar" }).at(-1) as HTMLButtonElement);
    expect(screen.getByPlaceholderText("Peça *")).toHaveValue("Display");
    fireEvent.change(screen.getByPlaceholderText("Código"), { target: { value: "DISP-51" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alteração" }));
    expect(mocked.updateRepairMutate).toHaveBeenCalledWith(expect.objectContaining({ id: 44, chamadoId: 12, peca: "Display", codigo: "DISP-51" }));
  });

  it("solicita confirmação antes de excluir uma peça e envia a remoção do mesmo registro", () => {
    mocked.queryState = { data: { call: { id: 12, numeroOs: "60006454345", modelo: "Modelo teste", serial: "ABC123", queixa: "Sem imagem", status: "EM ANDAMENTO", dataEntrada: new Date("2026-08-14T00:00:00Z"), updatedAt: new Date("2026-08-14T00:00:00Z") }, repairs: [{ id: 44, peca: "Display" }], history: [] } as any, isLoading: false, isError: false };
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(screen.getByRole("heading", { name: "Excluir esta peça?" })).toBeInTheDocument();
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(dialog.querySelector("button:last-child") as HTMLButtonElement);
    expect(mocked.deleteRepairMutate).toHaveBeenCalledWith({ id: 44, chamadoId: 12 });
  });

  it("exige diagnóstico e uma única inspeção antes de salvar os dados técnicos", () => {
    renderDetail();
    const save = screen.getByRole("button", { name: "Salvar dados técnicos" });
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name: "Diagnóstico" }), { target: { value: "Falha no display." } });
    fireEvent.click(screen.getByLabelText("SEM SINAIS DE MAU USO OU DE ABERTURA PRÉVIA."));
    expect(save).toBeEnabled();
    fireEvent.click(save);
    expect(mocked.updateTechnicalMutate).toHaveBeenCalledWith({ id: 12, diagnostico: "Falha no display.", inspecaoVisual: "SEM SINAIS DE MAU USO OU DE ABERTURA PRÉVIA." });
  });

  it("explica quais campos impedem a geração quando o script está incompleto", () => {
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: "GERAR SCRIPT TÉCNICO" }));
    expect(screen.getByText("NÃO É POSSÍVEL GERAR O SCRIPT")).toBeInTheDocument();
    expect(screen.getByText("Informe o diagnóstico do equipamento.")).toBeInTheDocument();
  });
});
