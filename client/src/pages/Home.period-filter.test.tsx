// @vitest-environment jsdom
import React, { useState } from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PeriodFilterPanel } from "./Home";

afterEach(cleanup);

function FilterHarness() {
  const [period, setPeriod] = useState("hoje");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  return <><PeriodFilterPanel period={period} setPeriod={setPeriod} customFrom={customFrom} setCustomFrom={setCustomFrom} customTo={customTo} setCustomTo={setCustomTo}/><output data-testid="period">{period}:{customFrom}:{customTo}</output></>;
}

describe("PeriodFilterPanel", () => {
  it("mantém as opções atuais em formato vertical e preserva o intervalo personalizado", () => {
    render(<FilterHarness/>);

    expect(screen.getByRole("button", { name: "Hoje" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Esta semana" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Este mês" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Este ano" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Personalizado" }));
    fireEvent.change(screen.getByLabelText("Data inicial"), { target: { value: "2026-08-01" } });
    fireEvent.change(screen.getByLabelText("Data final"), { target: { value: "2026-08-18" } });

    expect(screen.getByTestId("period")).toHaveTextContent("personalizado:2026-08-01:2026-08-18");
  });
});
