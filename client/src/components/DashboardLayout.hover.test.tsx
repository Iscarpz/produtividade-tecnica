// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocked = vi.hoisted(() => ({ setLocation: vi.fn(), logout: vi.fn() }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ loading: false, user: { name: "Vinicius Scarpeta" }, logout: mocked.logout }) }));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("wouter", () => ({ useLocation: () => ["/", mocked.setLocation] }));

import DashboardLayout, { PORTAL_ATP_URL, POSIFLOW_URL } from "./DashboardLayout";

afterEach(() => { mocked.setLocation.mockReset(); mocked.logout.mockReset(); });

describe("DashboardLayout — hover", () => {
  it("expande e recolhe a sidebar com o mouse sem mover o conteúdo principal", () => {
    const { container } = render(<DashboardLayout><div>Conteúdo</div></DashboardLayout>);
    const sidebar = container.querySelector("aside");
    expect(sidebar).toHaveClass("w-16");
    expect(container.querySelector(".ml-16")).toBeInTheDocument();

    fireEvent.mouseEnter(sidebar!);
    expect(sidebar).toHaveClass("w-64");
    expect(container.querySelector(".ml-64")).toBeInTheDocument();
    expect(screen.getByText("Portal ATP")).toBeInTheDocument();
    fireEvent.mouseLeave(sidebar!);
    expect(sidebar).toHaveClass("w-16");
  });

  it("abre Portal ATP e Posiflow em nova aba", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { container } = render(<DashboardLayout><div>Conteúdo</div></DashboardLayout>);
    fireEvent.mouseEnter(container.querySelector("aside")!);
    fireEvent.click(within(container).getByRole("button", { name: /Portal ATP/i }));
    fireEvent.click(within(container).getByRole("button", { name: /Posiflow/i }));
    expect(open).toHaveBeenCalledWith(PORTAL_ATP_URL, "_blank", "noopener,noreferrer");
    expect(open).toHaveBeenCalledWith(POSIFLOW_URL, "_blank", "noopener,noreferrer");
    open.mockRestore();
  });
});
