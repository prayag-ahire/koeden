ALTER TABLE "items" ADD COLUMN "is_deleted" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "deleted_at" timestamp;