CREATE TABLE "workspace_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"token" text NOT NULL UNIQUE,
	"invited_by_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"workspace_id" uuid,
	"user_id" text,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_members_pkey" PRIMARY KEY("workspace_id","user_id")
);
--> statement-breakpoint
CREATE INDEX "workspace_invitations_workspace_id_email_idx" ON "workspace_invitations" ("workspace_id","email");--> statement-breakpoint
CREATE INDEX "workspace_invitations_email_idx" ON "workspace_invitations" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_invitations_token_idx" ON "workspace_invitations" ("token");--> statement-breakpoint
CREATE INDEX "workspace_members_workspace_id_idx" ON "workspace_members" ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_members_user_id_idx" ON "workspace_members" ("user_id");--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_invited_by_id_user_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;