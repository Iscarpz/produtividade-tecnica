import { describe, expect, it, vi } from "vitest";

const laudo = vi.hoisted(() => ({
  createLaudo: vi.fn(), deleteLaudo: vi.fn(), duplicateLaudo: vi.fn(), getLaudo: vi.fn(), getLaudoPrefill: vi.fn(), getLaudoSettings: vi.fn(), listLaudoAudit: vi.fn(), listLaudos: vi.fn(), updateLaudoProfile: vi.fn(), updateLaudoSettings: vi.fn(), uploadLaudoImage: vi.fn(),
}));
vi.mock("./laudoDb", () => ({ ...laudo, LAUDO_BRANDS: ["Positivo", "Infinix", "Vaio", "Compaq"] }));
vi.mock("./db", () => ({ addRepair: vi.fn(), createCall: vi.fn(), createImageBiosCatalog: vi.fn(), deleteCall: vi.fn(), deleteImageBiosCatalog: vi.fn(), deleteRepair: vi.fn(), generateScriptForCall: vi.fn(), getCallBundle: vi.fn(), getCallByOs: vi.fn(), listCalls: vi.fn(), listHistoricalCalls: vi.fn(), listImageBiosCatalog: vi.fn(), productivity: vi.fn(), transitionCall: vi.fn(), updateCallData: vi.fn(), updateCallTechnicalData: vi.fn(), updateImageBiosCatalog: vi.fn(), updateRepair: vi.fn(), updateUserProfile: vi.fn() }));

import { appRouter } from "./routers";

function context(role: "user" | "manager" | "admin" = "user", id = 77) { return { user: { id, openId: `user-${id}`, name: "Técnico", email: "tecnico@example.com", role, accountStatus: "ACTIVE", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any }; }

describe("rotas do Laudo Creator integrado", () => {
  it("vincula o pré-preenchimento e a listagem ao usuário autenticado", async () => {
    laudo.getLaudoPrefill.mockResolvedValue({ chamadoId: 12, numeroChamado: "60006454345" }); laudo.listLaudos.mockResolvedValue([]);
    const caller = appRouter.createCaller(context("user", 77));
    await expect(caller.laudos.prefill({ chamadoId: 12 })).resolves.toMatchObject({ numeroChamado: "60006454345" });
    await caller.laudos.list({ search: "600", marca: "Infinix" });
    expect(laudo.getLaudoPrefill).toHaveBeenCalledWith(77, 12);
    expect(laudo.listLaudos).toHaveBeenCalledWith(77, "600", "Infinix");
  });

  it("mantém técnico bloqueado e permite ao gestor atualizar logos", async () => {
    await expect(appRouter.createCaller(context("user")).laudos.settings.update({ logoPositivo: "/manus-storage/logo.png" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    laudo.updateLaudoSettings.mockResolvedValue({ id: 1, logoPositivo: "/manus-storage/logo.png" });
    await expect(appRouter.createCaller(context("manager", 88)).laudos.settings.update({ logoPositivo: "/manus-storage/logo.png" })).resolves.toMatchObject({ id: 1 });
    expect(laudo.updateLaudoSettings).toHaveBeenCalledWith(88, { logoPositivo: "/manus-storage/logo.png" });
  });
});
