import { and, asc, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { callDeletionLogs, calls, history, imageBiosCatalog, invitations, productivityEvents, repairs, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { generateTechnicalScript, resolveCatalog, type VisualInspection } from "./technicalScript";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}
export function buildUserUpsertSet(values: InsertUser, persistRole = false) { return { email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn, ...(persistRole ? { role: values.role } : {}) }; }

export async function upsertUser(user: InsertUser) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const shouldPersistRole = Boolean(user.role) || Boolean(ENV.ownerOpenId && user.openId === ENV.ownerOpenId);
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date(), role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user") };
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: buildUserUpsertSet(values, shouldPersistRole) });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return rows[0]; }
export async function getUserById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.id, id)).limit(1); return rows[0]; }
export async function ensureOwnerAdmin(user: typeof users.$inferSelect) { const db = await getDb(); if (!db) return user; const isConfiguredOwner = Boolean(ENV.ownerOpenId && user.openId === ENV.ownerOpenId); const existingAdmin = (await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1))[0]; const firstUser = existingAdmin ? null : (await db.select({ id: users.id }).from(users).orderBy(asc(users.id)).limit(1))[0]; if (isConfiguredOwner || firstUser?.id === user.id) { await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id)); return { ...user, role: "admin" as const }; } return user; }
export async function getUserByEmail(email: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1); return rows[0]; }
export async function listUsersForAdmin() { const db = await getDb(); if (!db) return []; return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, accountStatus: users.accountStatus, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt)); }
export async function listInvitationsForAdmin() { const db = await getDb(); if (!db) return []; return db.select().from(invitations).orderBy(desc(invitations.createdAt)); }
export async function findInvitationByHash(tokenHash: string) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(invitations).where(eq(invitations.tokenHash, tokenHash)).limit(1))[0]; }
export function isInvitationAvailable(invitation: { status: string; expiresAt: Date }, now = new Date()) { return invitation.status === "PENDING" && invitation.expiresAt.getTime() > now.getTime(); }
export async function insertInvitation(data: { tokenHash: string; inviteeName: string; email: string; invitedByUserId: number; expiresAt: Date }) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); const result = await db.insert(invitations).values({ ...data, email: data.email.trim().toLowerCase() }); return Number(result[0].insertId); }
export async function revokeInvitation(invitationId: number) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); await db.update(invitations).set({ status: "REVOKED", revokedAt: new Date() }).where(and(eq(invitations.id, invitationId), eq(invitations.status, "PENDING"))); }
export async function createInvitedUser(data: { invitationId: number; name: string; email: string; passwordHash: string; openId: string }) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); return db.transaction(async (tx) => { const invitation = (await tx.select().from(invitations).where(eq(invitations.id, data.invitationId)).limit(1))[0]; if (!invitation || !isInvitationAvailable(invitation)) throw new Error("Convite inválido, expirado ou já utilizado"); const existing = (await tx.select({ id: users.id }).from(users).where(eq(users.email, data.email.trim().toLowerCase())).limit(1))[0]; if (existing) throw new Error("Já existe uma conta para este e-mail"); const result = await tx.insert(users).values({ openId: data.openId, name: data.name.trim(), email: data.email.trim().toLowerCase(), loginMethod: "invite-password", role: "user", accountStatus: "PENDING_AUTHORIZATION", passwordHash: data.passwordHash, lastSignedIn: new Date() }); const userId = Number(result[0].insertId); await tx.update(invitations).set({ status: "ACCEPTED", acceptedByUserId: userId, acceptedAt: new Date() }).where(eq(invitations.id, invitation.id)); return userId; }); }
export async function setUserAccountStatus(userId: number, accountStatus: "ACTIVE" | "REFUSED" | "REVOKED") { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); await db.update(users).set({ accountStatus }).where(eq(users.id, userId)); }
export async function setUserRole(userId: number, role: "user" | "manager") { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); await db.update(users).set({ role }).where(eq(users.id, userId)); }

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

export function buildNewCallValues(userId: number, data: { numeroOs: string; serial: string; modelo: string; queixa: string; queixaOriginal?: string; dataRecebimento: Date }, now = new Date()) { const { dataRecebimento, ...callData } = data; return { userId, ...callData, status: "RECEBIDO" as const, dataEntrada: dataRecebimento, dataInicioAndamento: null, dataFinalizacao: null, createdAt: now, updatedAt: now }; }
export async function createCall(userId: number, data: { numeroOs: string; serial: string; modelo: string; queixa: string; queixaOriginal?: string; dataRecebimento: Date }) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const now = new Date();
  const result = await db.insert(calls).values(buildNewCallValues(userId, data, now));
  const id = Number(result[0].insertId);
  await db.insert(history).values({ chamadoId: id, userId, evento: "Chamado recebido no setor", statusNovo: "RECEBIDO", observacao: `Data de recebimento: ${data.dataRecebimento.toLocaleDateString("pt-BR")}`, createdAt: now });
  await db.insert(productivityEvents).values({ chamadoId: id, userId, tipoEvento: "RECEBIDO", createdAt: now });
  return getCall(userId, id);
}

export async function updateCallData(userId: number, id: number, data: { modelo: string; serial: string; queixa: string }) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const call = await getCall(userId, id); if (!call) throw new Error("Chamado não encontrado");
  const modelo = data.modelo.trim();
  const catalog = await listActiveImageBiosCatalog();
  const resolved = resolveCatalog(modelo, catalog);
  const imagemBiosTipo = resolved?.tipo ?? null;
  const imagemBiosVersao = resolved?.versao ?? null;
  const changes = [call.modelo !== modelo && "modelo", call.serial !== data.serial.trim() && "serial", call.queixa !== data.queixa.trim() && "queixa", call.imagemBiosTipo !== imagemBiosTipo && "tipo de Imagem/BIOS", call.imagemBiosVersao !== imagemBiosVersao && "versão de Imagem/BIOS"].filter(Boolean) as string[];
  if (!changes.length) return getCallBundle(userId, id);
  const now = new Date();
  await db.update(calls).set({ modelo, serial: data.serial.trim(), queixa: data.queixa.trim(), imagemBiosTipo, imagemBiosVersao, updatedAt: now }).where(and(eq(calls.id, id), eq(calls.userId, userId)));
  await db.insert(history).values({ chamadoId: id, userId, evento: "Dados do chamado atualizados", observacao: `Campos alterados: ${changes.join(", ")}`, createdAt: now });
  return getCallBundle(userId, id);
}

export async function updateCallTechnicalData(userId: number, id: number, data: { diagnostico?: string; inspecaoVisual?: VisualInspection }) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const call = await getCall(userId, id); if (!call) throw new Error("Chamado não encontrado");
  const diagnostico = data.diagnostico === undefined ? call.diagnostico : data.diagnostico.trim();
  const inspecaoVisual = data.inspecaoVisual === undefined ? call.inspecaoVisual : data.inspecaoVisual;
  const catalog = await listActiveImageBiosCatalog();
  const resolved = resolveCatalog(call.modelo, catalog);
  const imagemBiosTipo = resolved?.tipo ?? null;
  const imagemBiosVersao = resolved?.versao ?? null;
  const changes = [call.diagnostico !== diagnostico && "diagnóstico", call.inspecaoVisual !== inspecaoVisual && "inspeção visual", call.imagemBiosTipo !== imagemBiosTipo && "tipo de Imagem/BIOS", call.imagemBiosVersao !== imagemBiosVersao && "versão de Imagem/BIOS"].filter(Boolean) as string[];
  if (!changes.length) return getCallBundle(userId, id);
  const now = new Date();
  await db.update(calls).set({ diagnostico, inspecaoVisual, imagemBiosTipo, imagemBiosVersao, updatedAt: now }).where(and(eq(calls.id, id), eq(calls.userId, userId)));
  await db.insert(history).values({ chamadoId: id, userId, evento: "Dados técnicos atualizados", observacao: `Campos alterados: ${changes.join(", ")}`, createdAt: now });
  return getCallBundle(userId, id);
}

export type ImageBiosInput = { modelo: string; marca: string; tipo: "IMAGEM" | "BIOS"; versao: string; ativo?: boolean; observacao?: string };
export async function listImageBiosCatalog(search?: string) { const db = await getDb(); if (!db) return []; const rows = await db.select().from(imageBiosCatalog).orderBy(asc(imageBiosCatalog.modelo)); const term = search?.trim().toUpperCase(); return term ? rows.filter((item) => `${item.modelo} ${item.marca} ${item.tipo} ${item.versao}`.toUpperCase().includes(term)) : rows; }
export async function listActiveImageBiosCatalog() { const db = await getDb(); if (!db) return []; return db.select().from(imageBiosCatalog).where(eq(imageBiosCatalog.ativo, true)).orderBy(asc(imageBiosCatalog.modelo)); }
export async function createImageBiosCatalog(data: ImageBiosInput) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); const result = await db.insert(imageBiosCatalog).values({ modelo: data.modelo.trim().toUpperCase(), marca: data.marca.trim().toUpperCase(), tipo: data.tipo, versao: data.versao.trim(), ativo: data.ativo ?? true, observacao: data.observacao?.trim() || null }); return (await db.select().from(imageBiosCatalog).where(eq(imageBiosCatalog.id, Number(result[0].insertId))).limit(1))[0]; }
export async function updateImageBiosCatalog(id: number, data: ImageBiosInput) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); await db.update(imageBiosCatalog).set({ modelo: data.modelo.trim().toUpperCase(), marca: data.marca.trim().toUpperCase(), tipo: data.tipo, versao: data.versao.trim(), ativo: data.ativo ?? true, observacao: data.observacao?.trim() || null }).where(eq(imageBiosCatalog.id, id)); return (await db.select().from(imageBiosCatalog).where(eq(imageBiosCatalog.id, id)).limit(1))[0]; }
export async function deleteImageBiosCatalog(id: number) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); await db.delete(imageBiosCatalog).where(eq(imageBiosCatalog.id, id)); return { success: true } as const; }
export async function generateScriptForCall(userId: number, id: number) { const bundle = await getCallBundle(userId, id); if (!bundle) throw new Error("Chamado não encontrado"); const catalog = await listActiveImageBiosCatalog(); return generateTechnicalScript(bundle.call, bundle.repairs, catalog); }

export async function deleteCallWithRelations(operations: { findCall: () => Promise<unknown>; deleteRepairs: () => Promise<unknown>; deleteHistory: () => Promise<unknown>; deleteProductivityEvents: () => Promise<unknown>; deleteCall: () => Promise<unknown>; recordDeletion: () => Promise<unknown> }) {
  if (!(await operations.findCall())) throw new Error("Chamado não encontrado");
  await operations.deleteRepairs();
  await operations.deleteHistory();
  await operations.deleteProductivityEvents();
  await operations.deleteCall();
  await operations.recordDeletion();
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
    recordDeletion: () => tx.insert(callDeletionLogs).values({ userId, deletedAt: new Date() }),
  }));
}

const transitions: Record<string, { status: any; event?: any; label: string; closed?: boolean; startsWork?: boolean; from: string[] }> = {
  "Iniciar andamento": { status: "EM ANDAMENTO", label: "Início do andamento", startsWork: true, from: ["RECEBIDO"] },
  "Enviar para PP": { status: "AGUARDANDO PP", event: "ENVIADO_PP", label: "Enviado para PP", from: ["EM ANDAMENTO"] },
  "Enviar para Orçamento": { status: "AGUARDANDO ORÇAMENTO", event: "ENVIADO_ORCAMENTO", label: "Enviado para orçamento", from: ["EM ANDAMENTO"] },
  "Enviar para Zurich": { status: "Zurich", event: "ENVIADO_Zurich", label: "Enviado para Zurich", from: ["EM ANDAMENTO"] },
  "Retornar para Andamento": { status: "EM ANDAMENTO", label: "Retornou para andamento", from: ["AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "Zurich"] },
  "Peça recebida": { status: "EM ANDAMENTO", label: "Peça recebida", from: ["AGUARDANDO PP"] },
  "Orçamento aprovado": { status: "EM ANDAMENTO", label: "Orçamento aprovado", from: ["AGUARDANDO ORÇAMENTO", "Zurich"] },
  "Orçamento recusado": { status: "RECUSADO", label: "Orçamento recusado", closed: true, from: ["AGUARDANDO ORÇAMENTO", "Zurich"] },
  "Finalizar": { status: "FINALIZADO", event: "FINALIZADO", label: "Chamado finalizado", closed: true, from: ["EM ANDAMENTO"] },
  "Reabrir chamado": { status: "EM ANDAMENTO", label: "Chamado reaberto", from: ["FINALIZADO"] },
  "Troca": { status: "TROCA", label: "Chamado marcado como troca", closed: true, from: ["AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "Zurich"] },
  "Recusado": { status: "RECUSADO", label: "Chamado recusado", closed: true, from: ["AGUARDANDO ORÇAMENTO", "Zurich"] },
};
export function isAllowedTransition(currentStatus: string, action: string) { const transition = transitions[action]; return Boolean(transition && transition.from.includes(currentStatus)); }
export async function transitionCall(userId: number, id: number, action: string) {
  const db = await getDb(); if (!db) throw new Error("Banco indisponível");
  const call = await getCall(userId, id); if (!call) throw new Error("Chamado não encontrado");
  const transition = transitions[action]; if (!isAllowedTransition(call.status, action)) throw new Error("Ação não disponível para o status atual");
  const now = new Date();
  await db.update(calls).set({ status: transition.status, dataInicioAndamento: transition.startsWork && !call.dataInicioAndamento ? now : call.dataInicioAndamento, dataFinalizacao: transition.closed ? now : null, updatedAt: now }).where(and(eq(calls.id, id), eq(calls.userId, userId)));
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
export type RepairInput = { peca: string; codigo?: string; serialRetirada?: string; serialInstalada?: string; observacao?: string };
export function buildRepairUpdatedHistoryEvent(userId: number, chamadoId: number, previous: { peca: string; codigo?: string | null; serialRetirada?: string | null; serialInstalada?: string | null; observacao?: string | null }, next: RepairInput, now = new Date()) { const labels = (["peca", "codigo", "serialRetirada", "serialInstalada", "observacao"] as const).filter((field) => (previous[field] || "") !== (next[field] || "")).map((field) => ({ peca: "peça", codigo: "código", serialRetirada: "série retirada", serialInstalada: "série instalada", observacao: "observação" })[field]); return { chamadoId, userId, evento: `Peça atualizada: ${next.peca}`, observacao: labels.length ? `Campos alterados: ${labels.join(", ")}` : "Registro revisado sem alteração de campos", createdAt: now }; }
export function buildRepairDeletedHistoryEvent(userId: number, chamadoId: number, repair: { peca: string; codigo?: string | null; serialRetirada?: string | null; serialInstalada?: string | null; observacao?: string | null }, now = new Date()) { return { chamadoId, userId, evento: `Peça excluída: ${repair.peca}`, observacao: buildRepairHistoryDetails({ codigo: repair.codigo ?? undefined, serialRetirada: repair.serialRetirada ?? undefined, serialInstalada: repair.serialInstalada ?? undefined, observacao: repair.observacao ?? undefined }) || null, createdAt: now }; }
export async function updateRepair(userId: number, data: RepairInput & { id: number; chamadoId: number }) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); return db.transaction(async (tx) => { if (!(await getCall(userId, data.chamadoId))) throw new Error("Chamado não encontrado"); const current = (await tx.select().from(repairs).where(and(eq(repairs.id, data.id), eq(repairs.chamadoId, data.chamadoId))).limit(1))[0]; if (!current) throw new Error("Peça não encontrada"); const next: RepairInput = { peca: data.peca.trim(), codigo: data.codigo?.trim() || undefined, serialRetirada: data.serialRetirada?.trim() || undefined, serialInstalada: data.serialInstalada?.trim() || undefined, observacao: data.observacao?.trim() || undefined }; const now = new Date(); await tx.update(repairs).set({ peca: next.peca, codigo: next.codigo ?? null, serialRetirada: next.serialRetirada ?? null, serialInstalada: next.serialInstalada ?? null, observacao: next.observacao ?? null }).where(and(eq(repairs.id, data.id), eq(repairs.chamadoId, data.chamadoId))); await tx.insert(history).values(buildRepairUpdatedHistoryEvent(userId, data.chamadoId, current, next, now)); return getCallBundle(userId, data.chamadoId); }); }
export async function deleteRepair(userId: number, data: { id: number; chamadoId: number }) { const db = await getDb(); if (!db) throw new Error("Banco indisponível"); return db.transaction(async (tx) => { if (!(await getCall(userId, data.chamadoId))) throw new Error("Chamado não encontrado"); const current = (await tx.select().from(repairs).where(and(eq(repairs.id, data.id), eq(repairs.chamadoId, data.chamadoId))).limit(1))[0]; if (!current) throw new Error("Peça não encontrada"); const now = new Date(); await tx.delete(repairs).where(and(eq(repairs.id, data.id), eq(repairs.chamadoId, data.chamadoId))); await tx.insert(history).values(buildRepairDeletedHistoryEvent(userId, data.chamadoId, current, now)); return getCallBundle(userId, data.chamadoId); }); }
export function buildProductivitySummary(rows: Array<{ type: string; count: number }>, deletedCount = 0) { return { ...Object.fromEntries(rows.map((row) => [row.type, Number(row.count)])), EXCLUIDO: Number(deletedCount) }; }
export async function productivity(userId: number, from: Date, to: Date) { const db = await getDb(); if (!db) return { RECEBIDO: 0, FINALIZADO: 0, ENVIADO_PP: 0, ENVIADO_ORCAMENTO: 0, ENVIADO_Zurich: 0, EXCLUIDO: 0 }; const [rows, deleted] = await Promise.all([db.select({ type: productivityEvents.tipoEvento, count: sql<number>`count(*)` }).from(productivityEvents).where(and(eq(productivityEvents.userId, userId), gte(productivityEvents.createdAt, from), lte(productivityEvents.createdAt, to))).groupBy(productivityEvents.tipoEvento), db.select({ count: sql<number>`count(*)` }).from(callDeletionLogs).where(and(eq(callDeletionLogs.userId, userId), gte(callDeletionLogs.deletedAt, from), lte(callDeletionLogs.deletedAt, to)))]); return buildProductivitySummary(rows.map((row) => ({ type: row.type, count: Number(row.count) })), Number(deleted[0]?.count || 0)); }
