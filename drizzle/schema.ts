import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const calls = mysqlTable("calls", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  numeroOs: varchar("numeroOs", { length: 64 }).notNull().unique(),
  serial: varchar("serial", { length: 128 }).notNull(),
  modelo: varchar("modelo", { length: 255 }).notNull(),
  queixa: text("queixa").notNull(),
  queixaOriginal: text("queixaOriginal"),
  status: mysqlEnum("status", ["EM ANDAMENTO", "AGUARDANDO PP", "AGUARDANDO ORÇAMENTO", "ZURICH", "FINALIZADO", "TROCA", "RECUSADO"]).notNull().default("EM ANDAMENTO"),
  dataEntrada: timestamp("dataEntrada").notNull().defaultNow(),
  dataFinalizacao: timestamp("dataFinalizacao"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
});

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
  tipoEvento: mysqlEnum("tipoEvento", ["RECEBIDO", "FINALIZADO", "ENVIADO_PP", "ENVIADO_ORCAMENTO", "ENVIADO_SEGURADORA"]).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Call = typeof calls.$inferSelect;
export type Repair = typeof repairs.$inferSelect;
export type History = typeof history.$inferSelect;
export type ProductivityEvent = typeof productivityEvents.$inferSelect;
