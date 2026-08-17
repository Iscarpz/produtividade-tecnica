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
  onCreate: vi.fn(),
  busy: false,
};

afterEach(() => {
  cleanup();
  baseProps.onNumeroOsChange.mockReset();
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
    render(<NewCallModal {...baseProps} parsed={{ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Não liga" }}/>);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Número do chamado")).toHaveValue("60006454345");
    expect(screen.getByLabelText("Data de recebimento no setor")).toHaveValue(new Date().toISOString().slice(0, 10));
    expect(screen.getByRole("button", { name: "CONFIRMAR RECEBIMENTO" })).toBeEnabled();
  });

  it("requer uma data de recebimento antes de confirmar o chamado", () => {
    render(<NewCallModal {...baseProps} parsed={{ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Não liga" }}/>);

    fireEvent.change(screen.getByLabelText("Data de recebimento no setor"), { target: { value: "" } });
    expect(screen.getByRole("button", { name: "CONFIRMAR RECEBIMENTO" })).toBeDisabled();
  });
});
