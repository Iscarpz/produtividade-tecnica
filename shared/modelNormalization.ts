export function normalizeModelName(value: string) {
  const compact = value.replace(/\u00a0/g, " ").replace(/[\t\n\r ]+/g, " ").trim();
  if (!compact) return "";
  const hasVaio = /\bVAIO\b/i.test(compact);
  const hasInfinix = /\bINFINIX\b/i.test(compact);
  const hasPositivo = /\bPOSITIVO\b/i.test(compact);
  const preferred = hasVaio ? "VAIO" : hasInfinix ? "INFINIX" : hasPositivo ? "POSITIVO" : "";
  if (!preferred) return compact;
  const source = compact.includes("/") ? compact.split("/").at(-1) || compact : compact;
  let remainder = source.replace(/\bPOSITIVO\b/gi, "").replace(/\bVAIO\b/gi, "").replace(/\bINFINIX\b/gi, "");
  if (preferred === "VAIO") remainder = remainder.replace(/^\s*TABLET\s+/i, "");
  remainder = remainder.replace(/[\t\n\r ]+/g, " ").trim();
  return `${preferred}${remainder ? ` ${remainder}` : ""}`;
}
