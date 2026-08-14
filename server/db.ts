import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { calls, history, productivityEvents, repairs, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

export async function upsertUser(user: InsertUser) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date(), role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user") };
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn, role: values.role } });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return rows[0]; }

export async function listCalls(userId: number, status?: string, search?: string) {
  const db = await getDb(); if (!db) return [];
  const filters = [eq(calls.userId, userId)];
  if (status) filters.push(eq(calls.status, status as any));
  if (search) filters.push(or(sql`${calls.numeroOs} like ${`%${search}%`}`, sql`${calls.serial} like ${`%${search}%`}`) as any);
  return db.select().from(calls).where(and(...filters)).orderBy(desc(calls.createdAt));
}
export async function getCall(userId: number, id: number) { const db = await getDb(); if (!db) return undefined; const row = await db.select().from(calls).where(and(eq(calls.id, id), eq(calls.userId, userId))).limit(1); return row[0]; }
export async function getCallByOs(userId: number, numeroOs: string) { const db = await getDb(); if (!db) return undefined; const row = await db.select().from(calls).where(and(eq(calls.userId, userId), eq(calls.numeroOs, numeroOs))).limit(1); return row[0]; }
export async function getCallBundle(userId: number, id: number) { const db = await getDb(); if (!db) return undefined; const call = await getCall(userId, id); if (!call) return undefined; const [repairRows, historyRows] = await Promise.all([db.select().from(repairs).where(eq(repairs.chamadoId, id)).orderBy(desc(repairs.createdAt)), db.select().from(history).where(eq(history.chamadoId, id)).orderBy(desc(history.createdAt))]); return { call, repairs: repairRows, history: historyRows }; }

export async function createCall(userId: number, data: { numeroOs: string; serial: string; modelo: string; queixa: string }) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const now = new Date();
  const result = await db.insert(calls).values({ userId, ...data, status: "EM ANDAMENTO", dataEntrada: now, createdAt: now, updatedAt: now });
  const id = Number(result[0].insertId);
  await db.insert(history).values({ chamadoId: id, userId, evento: "Chamado recebido", statusNovo: "EM ANDAMENTO", createdAt: now });
  await db.insert(productivityEvents).values({ chamadoId: id, userId, tipoEvento: "RECEBIDO", createdAt: now });
  return getCall(userId, id);
}

const transitions: Record<string, { status: any; event?: any; label: string; closed?: boolean; from: string[] }> = {
  "Enviar para PP": { status: "AGUARDANDO PP", event: "ENVIADO_PP", label: "Enviado para PP", from: ["EM ANDAMENTO"] },
  "Enviar para Orçamento": { status: "AGUARDANDO ORÇAMENTO", event: "ENVIADO_ORCAMENTO", label: "Enviado para orçamento", from: ["EM ANDAMENTO"] },
  "Enviar para Seguradora": { status: "AGUARDANDO SEGURADORA", event: "ENVIADO_SEGURADORA", label: "Enviado para seguradora", from: ["EM ANDAMENTO"] },
  "Retornar para Andamento": { status: "EM ANDAMENTO", label: "Retornou para andamento", from: ["AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "AGUARDANDO SEGURADORA"] },
  "Finalizar": { status: "FINALIZADO", event: "FINALIZADO", label: "Chamado finalizado", closed: true, from: ["EM ANDAMENTO"] },
  "Troca": { status: "TROCA", label: "Chamado marcado como troca", closed: true, from: ["AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "AGUARDANDO SEGURADORA"] },
  "Recusado": { status: "RECUSADO", label: "Chamado recusado", closed: true, from: ["AGUARDANDO ORÇAMENTO", "AGUARDANDO SEGURADORA"] },
};
export async function transitionCall(userId: number, id: number, action: string) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const call = await getCall(userId, id); if (!call) throw new Error("Chamado não encontrado");
  const transition = transitions[action]; if (!transition || !transition.from.includes(call.status)) throw new Error("Ação não disponível para o status atual");
  const now = new Date();
  await db.update(calls).set({ status: transition.status, dataFinalizacao: transition.closed ? now : null, updatedAt: now }).where(and(eq(calls.id, id), eq(calls.userId, userId)));
  await db.insert(history).values({ chamadoId: id, userId, evento: transition.label, statusAnterior: call.status, statusNovo: transition.status, createdAt: now });
  if (transition.event) await db.insert(productivityEvents).values({ chamadoId: id, userId, tipoEvento: transition.event, createdAt: now });
  return getCallBundle(userId, id);
}
export async function addRepair(userId: number, data: { chamadoId: number; peca: string; codigo?: string; serialRetirada?: string; serialInstalada?: string; observacao?: string }) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); if (!(await getCall(userId, data.chamadoId))) throw new Error("Chamado não encontrado"); await db.insert(repairs).values(data); return getCallBundle(userId, data.chamadoId); }
export async function productivity(userId: number, from: Date, to: Date) { const db = await getDb(); if (!db) return { RECEBIDO: 0, FINALIZADO: 0, ENVIADO_PP: 0, ENVIADO_ORCAMENTO: 0, ENVIADO_SEGURADORA: 0 }; const rows = await db.select({ type: productivityEvents.tipoEvento, count: sql<number>`count(*)` }).from(productivityEvents).where(and(eq(productivityEvents.userId, userId), gte(productivityEvents.createdAt, from), lte(productivityEvents.createdAt, to))).groupBy(productivityEvents.tipoEvento); return Object.fromEntries(rows.map((r) => [r.type, Number(r.count)])); }
