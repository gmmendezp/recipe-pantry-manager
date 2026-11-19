CREATE TABLE "demo_reset_state" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"last_reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demo_reset_state" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "demo_reset_state" ADD CONSTRAINT "demo_reset_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;