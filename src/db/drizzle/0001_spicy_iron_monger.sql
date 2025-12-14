CREATE TABLE `tag` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`is_official` boolean NOT NULL DEFAULT false,
	`user_id` int,
	CONSTRAINT `tag_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_tag_name` UNIQUE(`name`,`is_official`,`user_id`),
	CONSTRAINT `check_tag_owner` CHECK((
        (`tag`.`is_official` = TRUE AND `tag`.`user_id` IS NULL)
        OR
        (`tag`.`is_official` = FALSE AND `tag`.`user_id` IS NOT NULL)
      ))
);
--> statement-breakpoint
CREATE TABLE `memo_tag_relation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memo_id` int NOT NULL,
	`tag_id` int NOT NULL,
	CONSTRAINT `memo_tag_relation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tag` ADD CONSTRAINT `tag_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memo_tag_relation` ADD CONSTRAINT `memo_tag_relation_memo_id_memo_id_fk` FOREIGN KEY (`memo_id`) REFERENCES `memo`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memo_tag_relation` ADD CONSTRAINT `memo_tag_relation_tag_id_tag_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON DELETE cascade ON UPDATE no action;