ALTER TABLE `calls` MODIFY COLUMN `status` enum('EM ANDAMENTO','AGUARDANDO PP','AGUARDANDO ORÇAMENTO','ZURICH','ZURICH_TEMP','FINALIZADO','TROCA','RECUSADO') NOT NULL DEFAULT 'EM ANDAMENTO';--> statement-breakpoint
ALTER TABLE `productivityEvents` MODIFY COLUMN `tipoEvento` enum('RECEBIDO','FINALIZADO','ENVIADO_PP','ENVIADO_ORCAMENTO','ENVIADO_SEGURADORA','ENVIADO_ZURICH') NOT NULL;--> statement-breakpoint
UPDATE `calls` SET `status` = 'ZURICH_TEMP' WHERE `status` = 'ZURICH';--> statement-breakpoint
ALTER TABLE `calls` MODIFY COLUMN `status` enum('EM ANDAMENTO','AGUARDANDO PP','AGUARDANDO ORÇAMENTO','ZURICH_TEMP','Zurich','FINALIZADO','TROCA','RECUSADO') NOT NULL DEFAULT 'EM ANDAMENTO';--> statement-breakpoint
UPDATE `calls` SET `status` = 'Zurich' WHERE `status` = 'ZURICH_TEMP';--> statement-breakpoint
UPDATE `history` SET `statusAnterior` = 'Zurich' WHERE `statusAnterior` = 'ZURICH';--> statement-breakpoint
UPDATE `history` SET `statusNovo` = 'Zurich' WHERE `statusNovo` = 'ZURICH';--> statement-breakpoint
UPDATE `history` SET `evento` = REPLACE(`evento`, 'ZURICH', 'Zurich') WHERE `evento` LIKE '%ZURICH%';--> statement-breakpoint
UPDATE `productivityEvents` SET `tipoEvento` = 'ENVIADO_ZURICH' WHERE `tipoEvento` = 'ENVIADO_SEGURADORA';--> statement-breakpoint
ALTER TABLE `calls` MODIFY COLUMN `status` enum('EM ANDAMENTO','AGUARDANDO PP','AGUARDANDO ORÇAMENTO','Zurich','FINALIZADO','TROCA','RECUSADO') NOT NULL DEFAULT 'EM ANDAMENTO';--> statement-breakpoint
ALTER TABLE `productivityEvents` MODIFY COLUMN `tipoEvento` enum('RECEBIDO','FINALIZADO','ENVIADO_PP','ENVIADO_ORCAMENTO','ENVIADO_ZURICH') NOT NULL;
