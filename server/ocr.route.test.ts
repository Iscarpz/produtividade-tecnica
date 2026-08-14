import { describe, expect, it, vi } from "vitest";

const { extractCallFromImage } = vi.hoisted(() => ({ extractCallFromImage: vi.fn() }));
vi.mock("./ocr", () => ({ extractCallFromImage }));

import { appRouter } from "./routers";

describe("calls.extractFromImage", () => {
  it("retorna os dados extraídos para a etapa de conferência", async () => {
    extractCallFromImage.mockResolvedValue({ numeroOs: "123", serial: "SN1", modelo: "Modelo", queixa: "Não liga" });
    const caller = appRouter.createCaller({ user: { id: 1, openId: "test", name: "Técnico", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as any, res: {} as any });
    await expect(caller.calls.extractFromImage({ imageDataUrl: "data:image/png;base64,012345678901234567890123456789" })).resolves.toEqual({ numeroOs: "123", serial: "SN1", modelo: "Modelo", queixa: "Não liga" });
    expect(extractCallFromImage).toHaveBeenCalledWith("data:image/png;base64,012345678901234567890123456789");
  });
});
