// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OperationalOverview } from "./OperationalOverview";

afterEach(cleanup);

describe("OperationalOverview — produção em andamento", () => {
  it("conta somente chamados atualmente em andamento para a fila do técnico", () => {
    render(<OperationalOverview onSelect={vi.fn()} calls={[
      { id: 1, status: "EM ANDAMENTO", numeroOs: "1", modelo: "MODELO A", serial: "A", queixa: "Q", dataEntrada: new Date() },
      { id: 2, status: "EM ANDAMENTO", numeroOs: "2", modelo: "MODELO B", serial: "B", queixa: "Q", dataEntrada: new Date() },
      { id: 3, status: "AGUARDANDO PP", numeroOs: "3", modelo: "MODELO C", serial: "C", queixa: "Q", dataEntrada: new Date() },
    ]}/>);

    expect(screen.getByText("2 chamados em produção")).toBeInTheDocument();
    expect(screen.queryByText("3 chamados em produção")).not.toBeInTheDocument();
  });

  it("exibe recebidos no painel e os envia para a fila sem abrir o chamado", () => {
    const onStart = vi.fn();
    const onSelect = vi.fn();
    render(<OperationalOverview onSelect={onSelect} onStart={onStart} calls={[
      { id: 4, status: "RECEBIDO", numeroOs: "4", modelo: "VAIO TL12", serial: "S4", queixa: "Q", dataEntrada: new Date() },
    ]}/>);

    expect(screen.getByText("Recebidos do setor")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Colocar na fila" }));
    expect(onStart).toHaveBeenCalledWith(4);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
