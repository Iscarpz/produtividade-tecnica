CREATE TABLE `imageBiosCatalog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelo` varchar(255) NOT NULL,
	`marca` varchar(120) NOT NULL,
	`tipo` enum('IMAGEM','BIOS') NOT NULL,
	`versao` text NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`observacao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imageBiosCatalog_id` PRIMARY KEY(`id`),
	CONSTRAINT `image_bios_catalog_modelo_tipo_unique` UNIQUE(`modelo`,`tipo`)
);
--> statement-breakpoint
ALTER TABLE `calls` ADD `diagnostico` text;--> statement-breakpoint
ALTER TABLE `calls` ADD `inspecaoVisual` enum('SEM SINAIS DE MAU USO OU DE ABERTURA PRÉVIA.','MAU USO CONSTATADO - EQUIPAMENTO COM AVARIAS E/OU DANOS FÍSICOS','CONSTATADO ABERTURA PRÉVIA POR PESSOAL NÃO AUTORIZADO');