import { describe, expect, it } from "vitest";
import { createInvitationToken, hashInvitationToken, hashPassword, verifyPassword } from "./credentials";

describe("credenciais de convite", () => {
  it("gera tokens únicos e hashes estáveis sem expor a senha", async () => {
    const first = createInvitationToken();
    const second = createInvitationToken();
    expect(first).not.toBe(second);
    expect(hashInvitationToken(first)).toHaveLength(64);
    expect(hashInvitationToken(first)).toBe(hashInvitationToken(first));
    const passwordHash = await hashPassword("Senha-segura-123");
    expect(passwordHash).not.toContain("Senha-segura-123");
    await expect(verifyPassword("Senha-segura-123", passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("outra-senha", passwordHash)).resolves.toBe(false);
  });
});
