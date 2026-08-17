import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "manager", "admin"]).default("user").notNull(),
  accountStatus: mysqlEnum("accountStatus", ["ACTIVE", "PENDING_AUTHORIZATION", "REFUSED", "REVOKED"]).default("ACTIVE").notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  cargo: varchar("cargo", { length: 160 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const invitations = mysqlTable("invitations", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  inviteeName: varchar("inviteeName", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"]).default("PENDING").notNull(),
  invitedByUserId: int("invitedByUserId").notNull(),
  acceptedByUserId: int("acceptedByUserId"),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const calls = mysqlTable("calls", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  numeroOs: varchar("numeroOs", { length: 64 }).notNull(),
  serial: varchar("serial", { length: 128 }).notNull(),
  modelo: varchar("modelo", { length: 255 }).notNull(),
  queixa: text("queixa").notNull(),
  queixaOriginal: text("queixaOriginal"),
  diagnostico: text("diagnostico"),
  inspecaoVisual: mysqlEnum("inspecaoVisual", ["SEM SINAIS DE MAU USO OU DE ABERTURA PRÉVIA.", "MAU USO CONSTATADO - EQUIPAMENTO COM AVARIAS E/OU DANOS FÍSICOS", "CONSTATADO ABERTURA PRÉVIA POR PESSOAL NÃO AUTORIZADO"]),
  imagemBiosTipo: mysqlEnum("imagemBiosTipo", ["IMAGEM", "BIOS"]),
  imagemBiosVersao: text("imagemBiosVersao"),
  status: mysqlEnum("status", ["RECEBIDO", "EM ANDAMENTO", "AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "Zurich", "FINALIZADO", "TROCA", "RECUSADO"]).notNull().default("RECEBIDO"),
  dataEntrada: timestamp("dataEntrada").notNull().defaultNow(),
  dataInicioAndamento: timestamp("dataInicioAndamento"),
  dataFinalizacao: timestamp("dataFinalizacao"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
}, (table) => [uniqueIndex("calls_user_numeroOs_unique").on(table.userId, table.numeroOs)]);

export const repairs = mysqlTable("repairs", {
  id: int("id").autoincrement().primaryKey(),
  chamadoId: int("chamadoId").notNull(),
  peca: varchar("peca", { length: 255 }).notNull(),
  codigo: varchar("codigo", { length: 128 }),
  serialRetirada: varchar("serialRetirada", { length: 128 }),
  serialInstalada: varchar("serialInstalada", { length: 128 }),
  observacao: text("observacao"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const imageBiosCatalog = mysqlTable("imageBiosCatalog", {
  id: int("id").autoincrement().primaryKey(),
  modelo: varchar("modelo", { length: 255 }).notNull(),
  marca: varchar("marca", { length: 120 }).notNull(),
  tipo: mysqlEnum("tipo", ["IMAGEM", "BIOS"]).notNull(),
  versao: text("versao").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  observacao: text("observacao"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
}, (table) => [uniqueIndex("image_bios_catalog_modelo_tipo_unique").on(table.modelo, table.tipo)]);

export const laudos = mysqlTable("laudos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  chamadoId: int("chamadoId"),
  numeroChamado: varchar("numeroChamado", { length: 64 }).notNull(),
  dataEmissao: varchar("dataEmissao", { length: 10 }).notNull(),
  marca: mysqlEnum("marca", ["Positivo", "Infinix", "Vaio", "Compaq"]).notNull(),
  nomeCliente: varchar("nomeCliente", { length: 255 }).notNull(),
  contato: varchar("contato", { length: 255 }).notNull(),
  enderecoCliente: text("enderecoCliente").notNull(),
  cidadeCliente: varchar("cidadeCliente", { length: 160 }).notNull(),
  estadoCliente: varchar("estadoCliente", { length: 2 }).notNull(),
  produto: varchar("produto", { length: 255 }).notNull(),
  tipoProduto: varchar("tipoProduto", { length: 160 }).notNull(),
  numeroSerie: varchar("numeroSerie", { length: 128 }).notNull(),
  bilheteSeguro: varchar("bilheteSeguro", { length: 128 }),
  defeitoReclamado: text("defeitoReclamado").notNull(),
  avaliacaoTecnica: text("avaliacaoTecnica").notNull(),
  conclusao: text("conclusao").notNull(),
  mauUso: boolean("mauUso").notNull().default(false),
  responsavelTecnico: varchar("responsavelTecnico", { length: 255 }).notNull(),
  cargoTecnico: varchar("cargoTecnico", { length: 160 }),
  fotos: text("fotos").notNull(),
  status: mysqlEnum("status", ["rascunho", "finalizado"]).notNull().default("rascunho"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
}, (table) => [index("laudos_user_created_idx").on(table.userId, table.createdAt), index("laudos_chamado_idx").on(table.chamadoId)]);

export const laudoAuditLogs = mysqlTable("laudoAuditLogs", {
  id: int("id").autoincrement().primaryKey(),
  laudoId: int("laudoId").notNull(),
  userId: int("userId").notNull(),
  acao: varchar("acao", { length: 128 }).notNull(),
  numeroChamado: varchar("numeroChamado", { length: 64 }).notNull(),
  tecnicoResponsavel: varchar("tecnicoResponsavel", { length: 255 }).notNull(),
  detalhes: text("detalhes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => [index("laudo_audit_laudo_idx").on(table.laudoId, table.createdAt)]);

export const laudoSettings = mysqlTable("laudoSettings", {
  id: int("id").autoincrement().primaryKey(),
  logoPositivo: text("logoPositivo"),
  logoInfinix: text("logoInfinix"),
  logoVaio: text("logoVaio"),
  logoCompaq: text("logoCompaq"),
  updatedByUserId: int("updatedByUserId"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
});

export const history = mysqlTable("history", {
  id: int("id").autoincrement().primaryKey(),
  chamadoId: int("chamadoId").notNull(),
  userId: int("userId").notNull(),
  evento: varchar("evento", { length: 255 }).notNull(),
  statusAnterior: varchar("statusAnterior", { length: 64 }),
  statusNovo: varchar("statusNovo", { length: 64 }),
  observacao: text("observacao"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const productivityEvents = mysqlTable("productivityEvents", {
  id: int("id").autoincrement().primaryKey(),
  chamadoId: int("chamadoId").notNull(),
  userId: int("userId").notNull(),
  tipoEvento: mysqlEnum("tipoEvento", ["RECEBIDO", "FINALIZADO", "ENVIADO_PP", "ENVIADO_ORCAMENTO", "ENVIADO_Zurich"]).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const callDeletionLogs = mysqlTable("callDeletionLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  deletedAt: timestamp("deletedAt").notNull().defaultNow(),
}, (table) => [index("call_deletion_user_deleted_idx").on(table.userId, table.deletedAt)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;
export type Call = typeof calls.$inferSelect;
export type Repair = typeof repairs.$inferSelect;
export type ImageBiosCatalog = typeof imageBiosCatalog.$inferSelect;
export type Laudo = typeof laudos.$inferSelect;
export type LaudoAuditLog = typeof laudoAuditLogs.$inferSelect;
export type LaudoSettings = typeof laudoSettings.$inferSelect;
export type History = typeof history.$inferSelect;
export type ProductivityEvent = typeof productivityEvents.$inferSelect;
export type CallDeletionLog = typeof callDeletionLogs.$inferSelect;
