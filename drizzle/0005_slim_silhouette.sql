ALTER TABLE `productivityEvents` MODIFY COLUMN `tipoEvento` enum('RECEBIDO','FINALIZADO','ENVIADO_PP','ENVIADO_ORCAMENTO','ENVIADO_ZURICH','ENVIADO_ZURICH_TEMP') NOT NULL;--> statement-breakpoint
UPDATE `productivityEvents` SET `tipoEvento` = 'ENVIADO_ZURICH_TEMP' WHERE `tipoEvento` = 'ENVIADO_ZURICH';--> statement-breakpoint
ALTER TABLE `productivityEvents` MODIFY COLUMN `tipoEvento` enum('RECEBIDO','FINALIZADO','ENVIADO_PP','ENVIADO_ORCAMENTO','ENVIADO_ZURICH_TEMP','ENVIADO_Zurich') NOT NULL;--> statement-breakpoint
UPDATE `productivityEvents` SET `tipoEvento` = 'ENVIADO_Zurich' WHERE `tipoEvento` = 'ENVIADO_ZURICH_TEMP';--> statement-breakpoint
ALTER TABLE `productivityEvents` MODIFY COLUMN `tipoEvento` enum('RECEBIDO','FINALIZADO','ENVIADO_PP','ENVIADO_ORCAMENTO','ENVIADO_Zurich') NOT NULL;
