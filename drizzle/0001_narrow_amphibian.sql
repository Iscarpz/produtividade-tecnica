CREATE TABLE `calls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`numeroOs` varchar(64) NOT NULL,
	`serial` varchar(128) NOT NULL,
	`modelo` varchar(255) NOT NULL,
	`queixa` text NOT NULL,
	`status` enum('EM ANDAMENTO','AGUARDANDO PP','AGUARDANDO ORÇAMENTO','AGUARDANDO SEGURADORA','FINALIZADO','TROCA','RECUSADO') NOT NULL DEFAULT 'EM ANDAMENTO',
	`dataEntrada` timestamp NOT NULL DEFAULT (now()),
	`dataFinalizacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calls_id` PRIMARY KEY(`id`),
	CONSTRAINT `calls_numeroOs_unique` UNIQUE(`numeroOs`)
);
--> statement-breakpoint
CREATE TABLE `history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chamadoId` int NOT NULL,
	`userId` int NOT NULL,
	`evento` varchar(255) NOT NULL,
	`statusAnterior` varchar(64),
	`statusNovo` varchar(64),
	`observacao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productivityEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chamadoId` int NOT NULL,
	`userId` int NOT NULL,
	`tipoEvento` enum('RECEBIDO','FINALIZADO','ENVIADO_PP','ENVIADO_ORCAMENTO','ENVIADO_SEGURADORA') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productivityEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repairs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chamadoId` int NOT NULL,
	`peca` varchar(255) NOT NULL,
	`codigo` varchar(128),
	`serialRetirada` varchar(128),
	`serialInstalada` varchar(128),
	`observacao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `repairs_id` PRIMARY KEY(`id`)
);
