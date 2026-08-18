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

  it("permite ao Gestor listar somente os usuários administráveis da equipe", async () => {
    const members = await appRouter.createCaller(context("ACTIVE", "manager")).users.list();
    expect(members.every((member) => member.role !== "admin")).toBe(true);
  });

  it("impede o Gestor de alterar papéis, preservando o controle exclusivo do Owner", async () => {
    await expect(appRouter.createCaller(context("ACTIVE", "manager")).users.setRole({ userId: 88, role: "user" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("mantém técnicos fora da visão consolidada da equipe", async () => {
    await expect(appRouter.createCaller(context("ACTIVE", "user")).calls.listTeam()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
