import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LAUDO_CREATOR_URL, menuItems, PORTAL_ATP_URL, POSIFLOW_URL, toolItems } from "./DashboardLayout";

const source = readFileSync(new URL("./DashboardLayout.tsx", import.meta.url), "utf8");

describe("DashboardLayout — navegação", () => {
  it("expande pelo hover e mantém o conteúdo principal estável", () => {
    expect(source).toContain("onMouseEnter={() => setExpanded(true)}");
    expect(source).toContain("onMouseLeave={() => setExpanded(false)}");
    expect(source).toContain('expanded ? "ml-64" : "ml-16"');
  });

  it("remove PP e Orçamento da operação e expõe as ferramentas externas corretas", () => {
    expect(menuItems.map((item) => item.label)).not.toContain("PP");
    expect(menuItems.map((item) => item.label)).not.toContain("Orçamento");
    expect(toolItems).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Laudo Creator", url: LAUDO_CREATOR_URL, highlight: true }),
      expect.objectContaining({ label: "Portal ATP", url: PORTAL_ATP_URL }),
      expect.objectContaining({ label: "Posiflow", url: POSIFLOW_URL }),
    ]));
  });
});
