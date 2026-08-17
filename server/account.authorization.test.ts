import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

function context(accountStatus: "ACTIVE" | "PENDING_AUTHORIZATION" | "REFUSED" | "REVOKED", role: "user" | "manager" | "admin") {
  return { user: { id: 77, openId: "test", name: "Técnico", email: "test@example.com", loginMethod: "invite-password", role, accountStatus, passwordHash: "hash", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };
}

describe("autorização de conta", () => {
  it("bloqueia dados operacionais de técnico aguardando autorização", async () => {
    await expect(appRouter.createCaller(context("PENDING_AUTHORIZATION", "user")).calls.list()).rejects.toMatchObject({ code: "FORBIDDEN", message: "Acesso aguardando autorização" });
  });

  it.each(["REFUSED", "REVOKED"] as const)("bloqueia dados operacionais de conta %s", async (accountStatus) => {
    await expect(appRouter.createCaller(context(accountStatus, "user")).calls.list()).rejects.toMatchObject({ code: "FORBIDDEN", message: "Acesso aguardando autorização" });
  });

  it("impede técnicos ativos de acessar os procedures administrativos", async () => {
    await expect(appRouter.createCaller(context("ACTIVE", "user")).users.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("mantém o Gestor fora da administração de usuários do Owner", async () => {
    await expect(appRouter.createCaller(context("ACTIVE", "manager")).users.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
