CREATE TABLE `callDeletionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deletedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `callDeletionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `call_deletion_user_deleted_idx` ON `callDeletionLogs` (`userId`,`deletedAt`);