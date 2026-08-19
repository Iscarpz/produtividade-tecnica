CREATE TABLE `callAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chamadoId` int NOT NULL,
	`userId` int NOT NULL,
	`nomeArquivo` varchar(255) NOT NULL,
	`storageKey` text NOT NULL,
	`url` text NOT NULL,
	`contentType` varchar(160) NOT NULL,
	`tamanhoBytes` int NOT NULL,
	`tipo` enum('ANEXO','LAUDO_TECNICO') NOT NULL DEFAULT 'ANEXO',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `callAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `calls` ADD `observacoes` text;--> statement-breakpoint
CREATE INDEX `call_attachments_chamado_idx` ON `callAttachments` (`chamadoId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `call_attachments_user_idx` ON `callAttachments` (`userId`,`createdAt`);