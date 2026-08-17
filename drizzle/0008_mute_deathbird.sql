ALTER TABLE `calls` DROP INDEX `calls_numeroOs_unique`;
--> statement-breakpoint
ALTER TABLE `calls` ADD CONSTRAINT `calls_user_numeroOs_unique` UNIQUE(`userId`,`numeroOs`);
