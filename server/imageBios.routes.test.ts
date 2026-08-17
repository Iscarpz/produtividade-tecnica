import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  addRepair: vi.fn(), createCall: vi.fn(), createImageBiosCatalog: vi.fn(), deleteCall: vi.fn(), deleteImageBiosCatalog: vi.fn(), deleteRepair: vi.fn(), generateScriptForCall: vi.fn(), getCallBundle: vi.fn(), getCallByOs: vi.fn(), listCalls: vi.fn(), listHistoricalCalls: vi.fn(), listImageBiosCatalog: vi.fn(), productivity: vi.fn(), transitionCall: vi.fn(), updateCallData: vi.fn(), updateCallTechnicalData: vi.fn(), updateImageBiosCatalog: vi.fn(), updateRepair: vi.fn(), updateUserProfile: vi.fn(),
}));
vi.mock("./db", () => db);

import { appRouter } from "./routers";

const admin = { user: { id: 1, openId: "admin", name: "Administrador", email: "admin@example.com", loginMethod: "manus", role: "admin", accountStatus: "ACTIVE", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };
const technician = { user: { id: 2, openId: "tech", name: "Técnico", email: "tech@example.com", loginMethod: "invite-password", role: "user", accountStatus: "ACTIVE", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any };

describe("catálogo de Imagens/BIOS e Script.AI", () => {
  beforeEach(() => vi.clearAllMocks());

  it("permite ao administrador consultar e cadastrar uma versão", async () => {
    const entry = { id: 8, modelo: "INFINIX HOT 50I", marca: "INFINIX", tipo: "IMAGEM", versao: "VERSAO", ativo: true };
    db.listImageBiosCatalog.mockResolvedValueOnce([entry]);
    await expect(appRouter.createCaller(admin).imageBios.list({ search: "HOT 50" })).resolves.toEqual([entry]);
    expect(db.listImageBiosCatalog).toHaveBeenCalledWith("HOT 50");
    db.createImageBiosCatalog.mockResolvedValueOnce(entry);
    const input = { modelo: "INFINIX HOT 50I", marca: "INFINIX", tipo: "IMAGEM" as const, versao: "VERSAO", ativo: true };
    await expect(appRouter.createCaller(admin).imageBios.create(input)).resolves.toEqual(entry);
    expect(db.createImageBiosCatalog).toHaveBeenCalledWith(input);
  });

  it("bloqueia técnico não administrador da base compartilhada", async () => {
    await expect(appRouter.createCaller(technician).imageBios.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.listImageBiosCatalog).not.toHaveBeenCalled();
  });

  it("gera o script apenas para o chamado do técnico autenticado", async () => {
    const result = { errors: [], analysis: ["MODELO NORMALIZADO: INFINIX HOT 50I."], equipmentType: "SMARTPHONE/TABLET", script: "[MODELO:]\nINFINIX HOT 50I\n/" };
    db.generateScriptForCall.mockResolvedValueOnce(result);
    await expect(appRouter.createCaller(technician).calls.generateScript({ id: 44 })).resolves.toEqual(result);
    expect(db.generateScriptForCall).toHaveBeenCalledWith(2, 44);
  });
});
