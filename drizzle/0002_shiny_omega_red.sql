CREATE TABLE "concept_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"pattern_id" text NOT NULL,
	"concept" text NOT NULL,
	"confidence" real DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_discoveries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"concept" text NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"pattern_id" text
);
--> statement-breakpoint
ALTER TABLE "concept_tags" ADD CONSTRAINT "concept_tags_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_discoveries" ADD CONSTRAINT "user_discoveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_discoveries" ADD CONSTRAINT "user_discoveries_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE no action ON UPDATE no action;