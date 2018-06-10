CREATE TABLE `saved_images` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`uuid`	TEXT NOT NULL UNIQUE,
	`analysis_result`	TEXT,
	`meta`	TEXT,
	`date_created`	TEXT NOT NULL
);
