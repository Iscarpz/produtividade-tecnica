import { and, desc, eq, like, or } from "drizzle-orm";
import { laudoAuditLogs, laudos, laudoSettings, users } from "../drizzle/schema";
import { getCall, getDb } from "./db";
import { storagePut } from "./storage";

export const LAUDO_BRANDS = ["Positivo", "Infinix", "Vaio", "Compaq"] as const;
export type LaudoBrand = (typeof LAUDO_BRANDS)[number];
export type LaudoInput = {
  chamadoId?: number | null; numeroChamado: string; dataEmissao: string; marca: LaudoBrand;
  nomeCliente: string; contato: string; enderecoCliente: string; cidadeCliente: string; estadoCliente: string;
  produto: string; tipoProduto: string; numeroSerie: string; bilheteSeguro?: string; defeitoReclamado: string;
  avaliacaoTecnica: string; conclusao: string; mauUso: boolean; responsavelTecnico: string; cargoTecnico: string;
  fotos: string[]; status: "rascunho" | "finalizado";
};

function value(value?: string | null) { return value?.trim() || ""; }
function toStoredLaudo(input: LaudoInput) { return { ...input, chamadoId: input.chamadoId ?? null, bilheteSeguro: value(input.bilheteSeguro) || null, fotos: JSON.stringify(input.fotos) }; }
function parseLaudo<T extends { fotos: string }>(row: T) { return { ...row, fotos: JSON.parse(row.fotos || "[]") as string[] }; }

export function deriveLaudoBrandAndProduct(modelo: string) {
  const normalized = value(modelo).toUpperCase();
  const brands: Array<[LaudoBrand, RegExp]> = [["Infinix", /^INFINIX\s+/], ["Positivo", /^POSITIVO\s+/], ["Vaio", /^VAIO\s+/], ["Compaq", /^COMPAQ\s+/]];
  const found = brands.find(([, expression]) => expression.test(normalized));
  if (!found) return { marca: undefined, produto: value(modelo) };
  return { marca: found[0], produto: value(modelo).replace(found[1], "").trim() };
}

async function audit(userId: number, laudoId: number, numeroChamado: string, tecnicoResponsavel: string, acao: string, detalhes?: string) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  await db.insert(laudoAuditLogs).values({ userId, laudoId, numeroChamado, tecnicoResponsavel, acao, detalhes: detalhes || null });
}

export async function getLaudoPrefill(userId: number, chamadoId: number) {
  const [call, user] = await Promise.all([getCall(userId, chamadoId), (await getDb())?.select().from(users).where(eq(users.id, userId)).limit(1)]);
  if (!call) throw new Error("Chamado não encontrado");
  const derived = deriveLaudoBrandAndProduct(call.modelo);
  return { chamadoId: call.id, numeroChamado: call.numeroOs, marca: derived.marca, produto: derived.produto, numeroSerie: call.serial, defeitoReclamado: call.queixa, avaliacaoTecnica: value(call.diagnostico), inspecaoVisual: call.inspecaoVisual || "", responsavelTecnico: user?.[0]?.name || "", cargoTecnico: user?.[0]?.cargo || "" };
}

export async function listLaudos(userId: number, search?: string, marca?: LaudoBrand) {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(laudos.userId, userId)];
  if (marca) conditions.push(eq(laudos.marca, marca));
  if (search?.trim()) { const term = `%${search.trim()}%`; conditions.push(or(like(laudos.numeroChamado, term), like(laudos.nomeCliente, term), like(laudos.produto, term))!); }
  return (await db.select().from(laudos).where(and(...conditions)).orderBy(desc(laudos.createdAt))).map(parseLaudo);
}

export async function getLaudo(userId: number, id: number) {
  const db = await getDb(); if (!db) return undefined;
  const row = (await db.select().from(laudos).where(and(eq(laudos.id, id), eq(laudos.userId, userId))).limit(1))[0];
  return row ? parseLaudo(row) : undefined;
}

export async function createLaudo(userId: number, input: LaudoInput) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const result = await db.insert(laudos).values({ userId, ...toStoredLaudo(input) });
  const id = Number(result[0].insertId);
  const saved = await getLaudo(userId, id); if (!saved) throw new Error("Não foi possível salvar o laudo");
  await audit(userId, id, saved.numeroChamado, saved.responsavelTecnico, "Laudo criado", saved.chamadoId ? `Originado do chamado ${saved.numeroChamado}` : undefined);
  if (saved.status === "finalizado") await audit(userId, id, saved.numeroChamado, saved.responsavelTecnico, "PDF gerado");
  return saved;
}

export async function deleteLaudo(userId: number, id: number) {
  const existing = await getLaudo(userId, id); if (!existing) throw new Error("Laudo não encontrado");
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  await db.delete(laudos).where(and(eq(laudos.id, id), eq(laudos.userId, userId)));
  await audit(userId, id, existing.numeroChamado, existing.responsavelTecnico, "Laudo excluído");
  return { success: true } as const;
}

export async function duplicateLaudo(userId: number, id: number) {
  const original = await getLaudo(userId, id); if (!original) throw new Error("Laudo não encontrado");
  await audit(userId, id, original.numeroChamado, original.responsavelTecnico, "Laudo duplicado");
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, numeroChamado: _numeroChamado, status: _status, ...copy } = original;
  return { ...copy, fotos: original.fotos, chamadoId: original.chamadoId ?? undefined, numeroChamado: "", status: "rascunho" as const };
}

export async function listLaudoAudit(userId: number, laudoId: number) {
  const laudo = await getLaudo(userId, laudoId); if (!laudo) throw new Error("Laudo não encontrado");
  const db = await getDb(); if (!db) return [];
  return db.select().from(laudoAuditLogs).where(eq(laudoAuditLogs.laudoId, laudoId)).orderBy(desc(laudoAuditLogs.createdAt));
}

export async function recordLaudoPdf(userId: number, laudoId: number) {
  const laudo = await getLaudo(userId, laudoId); if (!laudo) throw new Error("Laudo não encontrado");
  await audit(userId, laudoId, laudo.numeroChamado, laudo.responsavelTecnico, "PDF gerado");
  return { success: true } as const;
}

export async function getLaudoSettings() { const db = await getDb(); if (!db) return undefined; return (await db.select().from(laudoSettings).orderBy(desc(laudoSettings.updatedAt)).limit(1))[0]; }
export async function updateLaudoSettings(userId: number, data: { logoPositivo?: string; logoInfinix?: string; logoVaio?: string; logoCompaq?: string }) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const current = await getLaudoSettings();
  if (current) { await db.update(laudoSettings).set({ ...data, updatedByUserId: userId, updatedAt: new Date() }).where(eq(laudoSettings.id, current.id)); return getLaudoSettings(); }
  const result = await db.insert(laudoSettings).values({ ...data, updatedByUserId: userId });
  return (await db.select().from(laudoSettings).where(eq(laudoSettings.id, Number(result[0].insertId))).limit(1))[0];
}

export async function uploadLaudoImage(userId: number, dataUrl: string, kind: "foto" | "logo") {
  const match = /^data:(image\/(?:jpeg|png|webp|gif|bmp));base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new Error("Formato de imagem inválido");
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 10MB");
  const extension = match[1].split("/")[1] === "jpeg" ? "jpg" : match[1].split("/")[1];
  const stored = await storagePut(`laudos/${userId}/${kind}-${Date.now()}.${extension}`, bytes, match[1]);
  return stored.url;
}

export async function updateLaudoProfile(userId: number, name: string, cargo: string) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  await db.update(users).set({ name: value(name), cargo: value(cargo), updatedAt: new Date() }).where(eq(users.id, userId));
  return (await db.select({ name: users.name, cargo: users.cargo }).from(users).where(eq(users.id, userId)).limit(1))[0];
}
