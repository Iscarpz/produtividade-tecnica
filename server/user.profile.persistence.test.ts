import { describe, expect, it } from "vitest";
import { buildUserUpsertSet } from "./db";

describe("persistência do perfil do técnico", () => {
  it("não sobrescreve o nome personalizado quando a autenticação sincroniza o usuário novamente", () => {
    const update = buildUserUpsertSet({ openId: "tecnico-1", name: "Nome do provedor", email: "tecnico@exemplo.com", loginMethod: "manus", lastSignedIn: new Date("2026-08-14T00:00:00Z"), role: "user" });
    expect(update).not.toHaveProperty("name");
    expect(update).toMatchObject({ email: "tecnico@exemplo.com", loginMethod: "manus", role: "user" });
  });
});
