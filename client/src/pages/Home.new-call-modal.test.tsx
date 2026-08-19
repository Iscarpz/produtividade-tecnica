// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewCallModal } from "./Home";

const baseProps = {
  paste: "",
  setPaste: vi.fn(),
  queixaOriginal: "Relato original",
  onParse: vi.fn(),
  onImage: vi.fn(),
  ocrBusy: false,
  onClose: vi.fn(),
  onNumeroOsChange: vi.fn(),
  onQueixaChange: vi.fn(),
  onCreate: vi.fn(),
  busy: false,
};

afterEach(() => {
  cleanup();
  baseProps.onNumeroOsChange.mockReset();
  baseProps.onQueixaChange.mockReset();
});

describe("NewCallModal — recebimento e número obrigatórios", () => {
  it("bloqueia a confirmação e permite preenchimento manual quando o chamado não foi identificado", () => {
    render(<NewCallModal {...baseProps} parsed={{ numeroOs: "", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Não liga" }}/>);

    expect(screen.getByRole("alert")).toHaveTextContent("Número do chamado não identificado");
    expect(screen.getByRole("button", { name: "CONFIRMAR RECEBIMENTO" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Número do chamado"), { target: { value: "60006454345" } });
    expect(baseProps.onNumeroOsChange).toHaveBeenCalledWith("60006454345");
  });

  it("mostra o número extraído e libera a confirmação quando todos os campos essenciais existem", () => {
    render(<NewCallModal {...baseProps} queixaOriginal="Aparelho retornou da assistência com problema na câmera." parsed={{ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Falha na câmera após retorno da assistência." }}/>);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Número do chamado")).toHaveValue("60006454345");
    expect(screen.getByLabelText("Data de recebimento no setor")).toHaveValue(new Date().toISOString().slice(0, 10));
    expect(screen.getByLabelText("Queixa organizada")).toHaveValue("Falha na câmera após retorno da assistência.");
    expect(screen.getByText("Ver descrição original extraída")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CONFIRMAR RECEBIMENTO" })).toBeEnabled();
  });

  it("permite revisar a queixa organizada antes da confirmação", () => {
    render(<NewCallModal {...baseProps} parsed={{ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Falha na câmera após retorno da assistência." }}/>);

    fireEvent.change(screen.getByLabelText("Queixa organizada"), { target: { value: "Câmera sem funcionamento." } });
    expect(baseProps.onQueixaChange).toHaveBeenCalledWith("Câmera sem funcionamento.");
  });

  it("requer uma data de recebimento antes de confirmar o chamado", () => {
    render(<NewCallModal {...baseProps} parsed={{ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Não liga" }}/>);

    fireEvent.change(screen.getByLabelText("Data de recebimento no setor"), { target: { value: "" } });
    expect(screen.getByRole("button", { name: "CONFIRMAR RECEBIMENTO" })).toBeDisabled();
  });

  it("avisa discretamente quando o serial possui histórico sem bloquear o novo chamado", () => {
    render(<NewCallModal {...baseProps} intakeCheck={{ duplicateStatus: null, hasSerialHistory: true }} parsed={{ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Não liga" }}/>);

    expect(screen.getByRole("status")).toHaveTextContent("EQUIPAMENTO COM HISTÓRICO");
    expect(screen.getByRole("button", { name: "CONFIRMAR RECEBIMENTO" })).toBeEnabled();
  });

  it("bloqueia somente o chamado duplicado e mostra o status atual", () => {
    render(<NewCallModal {...baseProps} intakeCheck={{ duplicateStatus: "EM ANDAMENTO", hasSerialHistory: true }} parsed={{ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Não liga" }}/>);

    expect(screen.getByRole("alert")).toHaveTextContent("CHAMADO JÁ CADASTRADO");
    expect(screen.getByRole("alert")).toHaveTextContent("Status atual: EM ANDAMENTO");
    expect(screen.queryByText("EQUIPAMENTO COM HISTÓRICO")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CONFIRMAR RECEBIMENTO" })).toBeDisabled();
  });
});
