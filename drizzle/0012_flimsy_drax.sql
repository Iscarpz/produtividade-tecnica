CREATE TABLE `laudoAuditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`laudoId` int NOT NULL,
	`userId` int NOT NULL,
	`acao` varchar(128) NOT NULL,
	`numeroChamado` varchar(64) NOT NULL,
	`tecnicoResponsavel` varchar(255) NOT NULL,
	`detalhes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `laudoAuditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `laudoSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`logoPositivo` text,
	`logoInfinix` text,
	`logoVaio` text,
	`logoCompaq` text,
	`updatedByUserId` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laudoSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `laudos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`chamadoId` int,
	`numeroChamado` varchar(64) NOT NULL,
	`dataEmissao` varchar(10) NOT NULL,
	`marca` enum('Positivo','Infinix','Vaio','Compaq') NOT NULL,
	`nomeCliente` varchar(255) NOT NULL,
	`contato` varchar(255) NOT NULL,
	`enderecoCliente` text NOT NULL,
	`cidadeCliente` varchar(160) NOT NULL,
	`estadoCliente` varchar(2) NOT NULL,
	`produto` varchar(255) NOT NULL,
	`tipoProduto` varchar(160) NOT NULL,
	`numeroSerie` varchar(128) NOT NULL,
	`bilheteSeguro` varchar(128),
	`defeitoReclamado` text NOT NULL,
	`avaliacaoTecnica` text NOT NULL,
	`conclusao` text NOT NULL,
	`mauUso` boolean NOT NULL DEFAULT false,
	`responsavelTecnico` varchar(255) NOT NULL,
	`cargoTecnico` varchar(160) NOT NULL,
	`fotos` text NOT NULL,
	`status` enum('rascunho','finalizado') NOT NULL DEFAULT 'rascunho',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laudos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `cargo` varchar(160);--> statement-breakpoint
CREATE INDEX `laudo_audit_laudo_idx` ON `laudoAuditLogs` (`laudoId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `laudos_user_created_idx` ON `laudos` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `laudos_chamado_idx` ON `laudos` (`chamadoId`);