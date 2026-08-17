ALTER TABLE `calls` MODIFY COLUMN `status` enum('RECEBIDO','EM ANDAMENTO','AGUARDANDO PP','AGUARDANDO ORÇAMENTO','Zurich','FINALIZADO','TROCA','RECUSADO') NOT NULL DEFAULT 'RECEBIDO';--> statement-breakpoint
ALTER TABLE `calls` ADD `dataInicioAndamento` timestamp;--> statement-breakpoint
UPDATE `calls` SET `dataInicioAndamento` = `dataEntrada` WHERE `dataInicioAndamento` IS NULL AND `status` <> 'RECEBIDO';
