/** @vitest-environment jsdom */
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { invalidate, updateProfile } = vi.hoisted(() => ({ invalidate: vi.fn(), updateProfile: vi.fn() }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { name: "Vinicius Scarpeta" }, logout: vi.fn() }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ auth: { me: { invalidate } } }), auth: { updateProfile: { useMutation: updateProfile } } } }));

import Settings from "./Settings";

describe("Configurações", () => {
  it("invalida o perfil autenticado após salvar para refletir o nome atualizado na sessão", () => {
    let options: { onSuccess: () => void } | undefined;
    updateProfile.mockImplementationOnce((input) => { options = input; return { mutate: vi.fn(), isPending: false }; });
    render(<Settings />);
    expect(screen.getByDisplayValue("Vinicius Scarpeta")).toBeInTheDocument();
    options?.onSuccess();
    expect(invalidate).toHaveBeenCalledTimes(1);
  });
});
