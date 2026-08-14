import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { calls, history, invitations, productivityEvents, repairs, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}
export function buildUserUpsertSet(values: InsertUser) { return { email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn, role: values.role }; }

export async function upsertUser(user: InsertUser) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date(), role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user") };
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: buildUserUpsertSet(values) });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return rows[0]; }
export async function getUserByEmail(email: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1); return rows[0]; }
export async function listUsersForAdmin() { const db = await getDb(); if (!db) return []; return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, accountStatus: users.accountStatus, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt)); }
export async function listInvitationsForAdmin() { const db = await getDb(); if (!db) return []; return db.select().from(invitations).orderBy(desc(invitations.createdAt)); }
export async function findInvitationByHash(tokenHash: string) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(invitations).where(eq(invitations.tokenHash, tokenHash)).limit(1))[0]; }
export function isInvitationAvailable(invitation: { status: string; expiresAt: Date }, now = new Date()) { return invitation.status === "PENDING" && invitation.expiresAt.getTime() > now.getTime(); }
export async function insertInvitation(data: { tokenHash: string; inviteeName: string; email: string; invitedByUserId: number; expiresAt: Date }) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); const result = await db.insert(invitations).values({ ...data, email: data.email.trim().toLowerCase() }); return Number(result[0].insertId); }
export async function revokeInvitation(invitationId: number) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); await db.update(invitations).set({ status: "REVOKED", revokedAt: new Date() }).where(and(eq(invitations.id, invitationId), eq(invitations.status, "PENDING"))); }
export async function createInvitedUser(data: { invitationId: number; name: string; email: string; passwordHash: string; openId: string }) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); return db.transaction(async (tx) => { const invitation = (await tx.select().from(invitations).where(eq(invitations.id, data.invitationId)).limit(1))[0]; if (!invitation || !isInvitationAvailable(invitation)) throw new Error("Convite inválido, expirado ou já utilizado"); const existing = (await tx.select({ id: users.id }).from(users).where(eq(users.email, data.email.trim().toLowerCase())).limit(1))[0]; if (existing) throw new Error("Já existe uma conta para este e-mail"); const result = await tx.insert(users).values({ openId: data.openId, name: data.name.trim(), email: data.email.trim().toLowerCase(), loginMethod: "invite-password", role: "user", accountStatus: "PENDING_AUTHORIZATION", passwordHash: data.passwordHash, lastSignedIn: new Date() }); const userId = Number(result[0].insertId); await tx.update(invitations).set({ status: "ACCEPTED", acceptedByUserId: userId, acceptedAt: new Date() }).where(eq(invitations.id, invitation.id)); return userId; }); }
export async function setUserAccountStatus(userId: number, accountStatus: "ACTIVE" | "REFUSED" | "REVOKED") { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); await db.update(users).set({ accountStatus }).where(eq(users.id, userId)); }

export async function listCalls(userId: number, status?: string, search?: string) {
  const db = await getDb(); if (!db) return [];
  const filters = [eq(calls.userId, userId)];
  if (status) filters.push(eq(calls.status, status as any));
  if (search) filters.push(or(sql`${calls.numeroOs} like ${`%${search}%`}`, sql`${calls.serial} like ${`%${search}%`}`) as any);
  return db.select().from(calls).where(and(...filters)).orderBy(desc(calls.createdAt));
}
export async function getCall(userId: number, id: number) { const db = await getDb(); if (!db) return undefined; const row = await db.select().from(calls).where(and(eq(calls.id, id), eq(calls.userId, userId))).limit(1); return row[0]; }
export async function getCallByOs(userId: number, numeroOs: string) { const db = await getDb(); if (!db) return undefined; const row = await db.select().from(calls).where(and(eq(calls.userId, userId), eq(calls.numeroOs, numeroOs))).limit(1); return row[0]; }
export async function updateUserProfile(userId: number, name: string) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); await db.update(users).set({ name: name.trim(), updatedAt: new Date() }).where(eq(users.id, userId)); return db.select().from(users).where(eq(users.id, userId)).limit(1).then((rows) => rows[0]); }
export async function listHistoricalCalls(userId: number, status: "TROCA" | "RECUSADO", search?: string) { const db = await getDb(); if (!db) return []; const rows = await listCalls(userId, status, search); return Promise.all(rows.map(async (call) => { const events = await db.select().from(history).where(and(eq(history.chamadoId, call.id), eq(history.statusNovo, status))).orderBy(desc(history.createdAt)).limit(1); const event = events[0]; return { ...call, dataMovimento: event?.createdAt ?? null, origem: event?.statusAnterior ?? null }; })); }
export async function getCallBundle(userId: number, id: number) { const db = await getDb(); if (!db) return undefined; const call = await getCall(userId, id); if (!call) return undefined; const [repairRows, historyRows] = await Promise.all([db.select().from(repairs).where(eq(repairs.chamadoId, id)).orderBy(desc(repairs.createdAt)), db.select().from(history).where(eq(history.chamadoId, id)).orderBy(desc(history.createdAt))]); return { call, repairs: repairRows, history: historyRows }; }

export function buildNewCallValues(userId: number, data: { numeroOs: string; serial: string; modelo: string; queixa: string; queixaOriginal?: string }, now = new Date()) { return { userId, ...data, status: "EM ANDAMENTO" as const, dataEntrada: now, dataFinalizacao: null, createdAt: now, updatedAt: now }; }
export async function createCall(userId: number, data: { numeroOs: string; serial: string; modelo: string; queixa: string; queixaOriginal?: string }) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const now = new Date();
  const result = await db.insert(calls).values(buildNewCallValues(userId, data, now));
  const id = Number(result[0].insertId);
  await db.insert(history).values({ chamadoId: id, userId, evento: "Chamado recebido", statusNovo: "EM ANDAMENTO", createdAt: now });
  await db.insert(productivityEvents).values({ chamadoId: id, userId, tipoEvento: "RECEBIDO", createdAt: now });
  return getCall(userId, id);
}

export async function updateCallData(userId: number, id: number, data: { modelo: string; serial: string; queixa: string }) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const call = await getCall(userId, id); if (!call) throw new Error("Chamado não encontrado");
  const changes = [call.modelo !== data.modelo.trim() && "modelo", call.serial !== data.serial.trim() && "serial", call.queixa !== data.queixa.trim() && "queixa"].filter(Boolean) as string[];
  if (!changes.length) return getCallBundle(userId, id);
  const now = new Date();
  await db.update(calls).set({ modelo: data.modelo.trim(), serial: data.serial.trim(), queixa: data.queixa.trim(), updatedAt: now }).where(and(eq(calls.id, id), eq(calls.userId, userId)));
  await db.insert(history).values({ chamadoId: id, userId, evento: "Dados do chamado atualizados", observacao: `Campos alterados: ${changes.join(", ")}`, createdAt: now });
  return getCallBundle(userId, id);
}

export async function deleteCallWithRelations(operations: { findCall: () => Promise<unknown>; deleteRepairs: () => Promise<unknown>; deleteHistory: () => Promise<unknown>; deleteProductivityEvents: () => Promise<unknown>; deleteCall: () => Promise<unknown> }) {
  if (!(await operations.findCall())) throw new Error("Chamado não encontrado");
  await operations.deleteRepairs();
  await operations.deleteHistory();
  await operations.deleteProductivityEvents();
  await operations.deleteCall();
  return { success: true } as const;
}

export async function deleteCall(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");
  return db.transaction(async (tx) => deleteCallWithRelations({
    findCall: async () => (await tx.select({ id: calls.id }).from(calls).where(and(eq(calls.id, id), eq(calls.userId, userId))).limit(1))[0],
    deleteRepairs: () => tx.delete(repairs).where(eq(repairs.chamadoId, id)),
    deleteHistory: () => tx.delete(history).where(eq(history.chamadoId, id)),
    deleteProductivityEvents: () => tx.delete(productivityEvents).where(eq(productivityEvents.chamadoId, id)),
    deleteCall: () => tx.delete(calls).where(and(eq(calls.id, id), eq(calls.userId, userId))),
  }));
}

const transitions: Record<string, { status: any; event?: any; label: string; closed?: boolean; from: string[] }> = {
  "Enviar para PP": { status: "AGUARDANDO PP", event: "ENVIADO_PP", label: "Enviado para PP", from: ["EM ANDAMENTO"] },
  "Enviar para Orçamento": { status: "AGUARDANDO ORÇAMENTO", event: "ENVIADO_ORCAMENTO", label: "Enviado para orçamento", from: ["EM ANDAMENTO"] },
  "Enviar para Zurich": { status: "Zurich", event: "ENVIADO_Zurich", label: "Enviado para Zurich", from: ["EM ANDAMENTO"] },
  "Retornar para Andamento": { status: "EM ANDAMENTO", label: "Retornou para andamento", from: ["AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "Zurich"] },
  "Peça recebida": { status: "EM ANDAMENTO", label: "Peça recebida", from: ["AGUARDANDO PP"] },
  "Orçamento aprovado": { status: "EM ANDAMENTO", label: "Orçamento aprovado", from: ["AGUARDANDO ORÇAMENTO", "Zurich"] },
  "Orçamento recusado": { status: "RECUSADO", label: "Orçamento recusado", closed: true, from: ["AGUARDANDO ORÇAMENTO", "Zurich"] },
  "Finalizar": { status: "FINALIZADO", event: "FINALIZADO", label: "Chamado finalizado", closed: true, from: ["EM ANDAMENTO"] },
  "Troca": { status: "TROCA", label: "Chamado marcado como troca", closed: true, from: ["AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "Zurich"] },
  "Recusado": { status: "RECUSADO", label: "Chamado recusado", closed: true, from: ["AGUARDANDO ORÇAMENTO", "Zurich"] },
};
export function isAllowedTransition(currentStatus: string, action: string) { const transition = transitions[action]; return Boolean(transition && transition.from.includes(currentStatus)); }
export async function transitionCall(userId: number, id: number, action: string) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const call = await getCall(userId, id); if (!call) throw new Error("Chamado não encontrado");
  const transition = transitions[action]; if (!isAllowedTransition(call.status, action)) throw new Error("Ação não disponível para o status atual");
  const now = new Date();
  await db.update(calls).set({ status: transition.status, dataFinalizacao: transition.closed ? now : null, updatedAt: now }).where(and(eq(calls.id, id), eq(calls.userId, userId)));
  await db.insert(history).values({ chamadoId: id, userId, evento: transition.label, statusAnterior: call.status, statusNovo: transition.status, createdAt: now });
  if (transition.event) await db.insert(productivityEvents).values({ chamadoId: id, userId, tipoEvento: transition.event, createdAt: now });
  return getCallBundle(userId, id);
}
export function buildRepairHistoryDetails(data: { codigo?: string; serialRetirada?: string; serialInstalada?: string; observacao?: string }) { return [data.codigo && `Código: ${data.codigo}`, data.serialRetirada && `S/N retirada: ${data.serialRetirada}`, data.serialInstalada && `S/N instalada: ${data.serialInstalada}`, data.observacao].filter(Boolean).join(" · "); }
export function buildRepairHistoryEvent(userId: number, data: { chamadoId: number; peca: string; codigo?: string; serialRetirada?: string; serialInstalada?: string; observacao?: string }, now = new Date()) { return { chamadoId: data.chamadoId, userId, evento: `Peça adicionada: ${data.peca}`, observacao: buildRepairHistoryDetails(data) || null, createdAt: now }; }
export async function persistRepairWithHistory(operations: { getCall: () => Promise<unknown>; insertRepair: () => Promise<unknown>; insertHistory: (event: ReturnType<typeof buildRepairHistoryEvent>) => Promise<unknown>; getBundle: () => Promise<{ history: Array<{ evento: string; observacao?: string | null }> } | undefined> }, userId: number, data: { chamadoId: number; peca: string; codigo?: string; serialRetirada?: string; serialInstalada?: string; observacao?: string }) {
  if (!(await operations.getCall())) throw new Error("Chamado não encontrado");
  const event = buildRepairHistoryEvent(userId, data);
  await operations.insertRepair();
  await operations.insertHistory(event);
  const bundle = await operations.getBundle();
  if (!bundle?.history.some((item) => item.evento === event.evento && item.observacao === event.observacao)) throw new Error("Evento de reparo não encontrado no histórico");
  return bundle;
}
export async function addRepair(userId: number, data: { chamadoId: number; peca: string; codigo?: string; serialRetirada?: string; serialInstalada?: string; observacao?: string }) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); return persistRepairWithHistory({ getCall: () => getCall(userId, data.chamadoId), insertRepair: () => db.insert(repairs).values(data), insertHistory: (event) => db.insert(history).values(event), getBundle: () => getCallBundle(userId, data.chamadoId) }, userId, data); }
export async function productivity(userId: number, from: Date, to: Date) { const db = await getDb(); if (!db) return { RECEBIDO: 0, FINALIZADO: 0, ENVIADO_PP: 0, ENVIADO_ORCAMENTO: 0, ENVIADO_Zurich: 0 }; const rows = await db.select({ type: productivityEvents.tipoEvento, count: sql<number>`count(*)` }).from(productivityEvents).where(and(eq(productivityEvents.userId, userId), gte(productivityEvents.createdAt, from), lte(productivityEvents.createdAt, to))).groupBy(productivityEvents.tipoEvento); return Object.fromEntries(rows.map((r) => [r.type, Number(r.count)])); }
