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

describe("NewCallModal — número obrigatório", () => {
  it("bloqueia a confirmação e permite preenchimento manual quando o chamado não foi identificado", () => {
    render(<NewCallModal {...baseProps} parsed={{ numeroOs: "", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Não liga" }}/>);

    expect(screen.getByRole("alert")).toHaveTextContent("Número do chamado não identificado");
    expect(screen.getByRole("button", { name: "CONFIRMAR CHAMADO" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Número do chamado"), { target: { value: "60006454345" } });
    expect(baseProps.onNumeroOsChange).toHaveBeenCalledWith("60006454345");
  });

  it("mostra o número extraído e libera a confirmação quando todos os campos essenciais existem", () => {
    render(<NewCallModal {...baseProps} parsed={{ numeroOs: "60006454345", serial: "5A538SY82", modelo: "INFINIX HOT 50I PRETO", queixa: "Não liga" }}/>);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Número do chamado")).toHaveValue("60006454345");
    expect(screen.getByRole("button", { name: "CONFIRMAR CHAMADO" })).toBeEnabled();
  });
});
