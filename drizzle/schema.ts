import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accountStatus: mysqlEnum("accountStatus", ["ACTIVE", "PENDING_AUTHORIZATION", "REFUSED", "REVOKED"]).default("ACTIVE").notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }),
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
  status: mysqlEnum("status", ["EM ANDAMENTO", "AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "Zurich", "FINALIZADO", "TROCA", "RECUSADO"]).notNull().default("EM ANDAMENTO"),
  dataEntrada: timestamp("dataEntrada").notNull().defaultNow(),
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;
export type Call = typeof calls.$inferSelect;
export type Repair = typeof repairs.$inferSelect;
export type ImageBiosCatalog = typeof imageBiosCatalog.$inferSelect;
export type History = typeof history.$inferSelect;
export type ProductivityEvent = typeof productivityEvents.$inferSelect;
