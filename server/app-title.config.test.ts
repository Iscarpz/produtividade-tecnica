import { describe, expect, it } from "vitest";

describe("configuração institucional da aplicação", () => {
  it("mantém o título TECBASE configurado para a interface", () => {
    expect(process.env.VITE_APP_TITLE).toBe("TECBASE");
  });
});
