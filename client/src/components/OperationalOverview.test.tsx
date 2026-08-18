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

  it("exibe todos os dados dos recebidos e os envia para a fila sem abrir o chamado", () => {
    const onStart = vi.fn();
    const onSelect = vi.fn();
    render(<OperationalOverview onSelect={onSelect} onStart={onStart} calls={[
      { id: 4, status: "RECEBIDO", numeroOs: "60006451515", modelo: "INFINIX SMART 10", serial: "S4", queixa: "APARELHO NÃO LIGA", dataEntrada: new Date("2026-08-18T12:00:00Z") },
      { id: 5, status: "RECEBIDO", numeroOs: "60006451516", modelo: "VAIO TL12", serial: "S5", queixa: "SEM IMAGEM", dataEntrada: new Date("2026-08-17T12:00:00Z") },
    ]}/>);

    expect(screen.getByText("Chamados recebidos")).toBeInTheDocument();
    expect(screen.getByText("60006451515")).toBeInTheDocument();
    expect(screen.getByText("INFINIX SMART 10")).toBeInTheDocument();
    expect(screen.getByText("APARELHO NÃO LIGA")).toBeInTheDocument();
    expect(screen.getAllByText("Recebido:")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Colocar em andamento" })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Colocar em andamento" })[0]!);
    expect(onStart).toHaveBeenCalledWith(4);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
