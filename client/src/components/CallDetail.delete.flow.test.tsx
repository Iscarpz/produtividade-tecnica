// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({
  close: vi.fn(),
  refresh: vi.fn(),
  setLocation: vi.fn(),
  detailQuery: vi.fn(),
  invalidate: vi.fn(),
  transitionMutate: vi.fn(),
  transitionSuccess: null as null | ((result: unknown, variables: { id: number; action: string }) => Promise<void>),
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
      transition: { useMutation: ({ onSuccess }: { onSuccess: (result: unknown, variables: { id: number; action: string }) => Promise<void> }) => { mocked.transitionSuccess = onSuccess; return { isPending: false, mutate: mocked.transitionMutate }; } },
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

import { CallDetail, getOperationalTimeline } from "./CallDetail";

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
  mocked.transitionSuccess = null;
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

describe("CallDetail — timeline operacional", () => {
  it("oculta auditorias internas e sintetiza o reparo realizado sem apagar os dados de origem", () => {
    const timeline = getOperationalTimeline([
      { id: 1, evento: "Chamado recebido", statusNovo: "EM ANDAMENTO", createdAt: new Date("2026-08-01T08:00:00Z") },
      { id: 2, evento: "Dados técnicos atualizados", createdAt: new Date("2026-08-01T09:00:00Z") },
      { id: 3, evento: "Peça adicionada: LCD", createdAt: new Date("2026-08-01T10:00:00Z") },
      { id: 4, evento: "Enviado para PP", statusAnterior: "EM ANDAMENTO", statusNovo: "AGUARDANDO PP", createdAt: new Date("2026-08-01T11:00:00Z") },
      { id: 5, evento: "Chamado reaberto", statusAnterior: "FINALIZADO", statusNovo: "EM ANDAMENTO", createdAt: new Date("2026-08-02T08:00:00Z") },
    ], [{ id: 40 }]);
    expect(timeline.map((event) => event.evento)).toEqual(["Chamado recebido", "Reparo realizado", "Enviado para PP", "Chamado reaberto"]);
    expect(timeline.some((event) => event.evento === "Dados técnicos atualizados")).toBe(false);
    expect(timeline.some((event) => event.evento.startsWith("Peça adicionada"))).toBe(false);
  });
});

describe("CallDetail — laudo e peças", () => {
  it("exibe Reabrir chamado para finalizados e atualiza os dados operacionais ao reabrir", async () => {
    mocked.queryState = { data: { call: { id: 12, numeroOs: "60006454345", modelo: "Modelo teste", serial: "ABC123", queixa: "Sem imagem", status: "FINALIZADO", dataEntrada: new Date("2026-08-14T00:00:00Z"), dataFinalizacao: new Date("2026-08-15T00:00:00Z"), updatedAt: new Date("2026-08-15T00:00:00Z") }, repairs: [], history: [] } as any, isLoading: false, isError: false };
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: "Reabrir chamado" }));
    expect(mocked.transitionMutate).toHaveBeenCalledWith({ id: 12, action: "Reabrir chamado" });
    await act(async () => { await mocked.transitionSuccess?.({}, { id: 12, action: "Reabrir chamado" }); });
    expect(mocked.invalidate).toHaveBeenCalled();
    expect(mocked.close).not.toHaveBeenCalled();
  });

  it("fecha a ficha e retorna à fila em andamento após finalizar", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }));
    await act(async () => { await mocked.transitionSuccess?.({}, { id: 12, action: "Finalizar" }); });
    expect(mocked.close).toHaveBeenCalledTimes(1);
    expect(mocked.setLocation).toHaveBeenCalledWith("/fila/em-andamento");
    expect(mocked.invalidate).toHaveBeenCalled();
    confirm.mockRestore();
  });

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
    expect(open).toHaveBeenCalledWith("/laudos/novo?chamado=12", "_blank", "noopener,noreferrer");
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

  it("salva diagnóstico automaticamente e persiste a inspeção ao selecioná-la", async () => {
    vi.useFakeTimers();
    renderDetail();
    fireEvent.change(screen.getByRole("textbox", { name: "Diagnóstico" }), { target: { value: "Falha no display." } });
    await act(async () => { await vi.advanceTimersByTimeAsync(650); });
    expect(mocked.updateTechnicalMutate).toHaveBeenCalledWith({ id: 12, diagnostico: "Falha no display." });
    fireEvent.click(screen.getByLabelText("SEM SINAIS DE MAU USO OU DE ABERTURA PRÉVIA."));
    expect(mocked.updateTechnicalMutate).toHaveBeenCalledWith({ id: 12, inspecaoVisual: "SEM SINAIS DE MAU USO OU DE ABERTURA PRÉVIA." });
    expect(screen.queryByRole("button", { name: "Salvar dados técnicos" })).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("explica quais campos impedem a geração quando o script está incompleto", () => {
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: "GERAR SCRIPT TÉCNICO" }));
    expect(screen.getByText("NÃO É POSSÍVEL GERAR O SCRIPT")).toBeInTheDocument();
    expect(screen.getByText("Informe o diagnóstico do equipamento.")).toBeInTheDocument();
  });

  it("exibe somente o script técnico final sem análise ou cabeçalhos intermediários", () => {
    mocked.scriptState = { data: { errors: [], analysis: ["CHAMADO: 60006454345."], equipmentType: "SMARTPHONE/TABLET", script: "[MODELO:]\nMODELO TESTE\n/\n[REPARO:]\nCOMPONENTES SUBSTITUIDOS:\nLCD - SERIAL INSTALADO: NEW\n/" }, isLoading: false, isError: false } as any;
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: "GERAR SCRIPT TÉCNICO" }));
    expect(screen.getByText(/COMPONENTES SUBSTITUIDOS:/)).toBeInTheDocument();
    expect(screen.queryByText("ANALISE DO CHAMADO")).not.toBeInTheDocument();
    expect(screen.queryByText("SCRIPT PREENCHIDO")).not.toBeInTheDocument();
    expect(screen.queryByText("CHAMADO: 60006454345.")).not.toBeInTheDocument();
  });
});
