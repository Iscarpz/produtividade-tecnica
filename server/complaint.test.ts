import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn(async () => ({ choices: [{ message: { content: JSON.stringify({ queixaFormalizada: "Equipamento apresenta desligamentos espontâneos e travamentos durante a utilização." }) } }] })) }));

import { formalizeComplaint } from "./complaint";

describe("formalizeComplaint", () => {
  it("preserva a queixa original e retorna a versão formalizada", async () => {
    const result = await formalizeComplaint("Desliga sozinho. Trava durante utilização.");
    expect(result.queixaOriginal).toBe("Desliga sozinho. Trava durante utilização.");
    expect(result.queixaFormalizada).toContain("desligamentos espontâneos");
  });
});
