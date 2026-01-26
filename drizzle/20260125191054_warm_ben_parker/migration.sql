CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text,
	"ownerId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "workspaces_ownerId_idx" ON "workspaces" ("ownerId");--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_ownerId_user_id_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id");