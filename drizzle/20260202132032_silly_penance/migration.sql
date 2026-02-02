CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"workspaceId" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"color" text DEFAULT '#6a7282' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "projects_workspaceId_idx" ON "projects" ("workspaceId");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspaceId_workspaces_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE;