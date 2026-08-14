import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeLLM } = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM }));

import { extractCallFromImage } from "./ocr";

describe("extractCallFromImage", () => {
  beforeEach(() => invokeLLM.mockReset());
  it("converte a resposta estruturada do OCR em dados de chamado", async () => {
    invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ numeroOs: "60006454345", serial: "ABC123", modelo: "NOTEBOOK XYZ", queixa: "Não liga" }) } }] });
    await expect(extractCallFromImage("data:image/png;base64,example")).resolves.toEqual({ numeroOs: "60006454345", serial: "ABC123", modelo: "NOTEBOOK XYZ", queixa: "Não liga" });
    expect(invokeLLM).toHaveBeenCalledOnce();
  });
});
