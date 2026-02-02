# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test         # Vitest (watch mode)
pnpm test:run     # Vitest (single run)
pnpm test:run src/features/workspace/__tests__/workspace-service.test.ts  # Single test file
pnpm db:generate # Generate migration schema
pnpm db:migrate # Migrate data
pnpm db:push # force push database schema
```

## Tech Stack

- **Next.js 16** (App Router) with **React 19** and React Compiler
- **TypeScript** (strict mode), path alias `@/*` maps to `src/*`
- **PostgreSQL** via Vercel Postgres + **Drizzle ORM**
- **Better-auth** with email OTP (Resend for email delivery)
- **Shadcn/ui** (New York style) + **TailwindCSS v4**
- **Zod** for validation, **React Hook Form** for forms
- **Vitest** for testing with v8 coverage
- **pnpm** as package manager

## Architecture

Feature-based architecture with layered separation. Each feature in `src/features/` follows this flow:

```
Component → Action (server action) → Service → Repository → Database
                                       ↓
                                   Validation (Zod)
```

### Feature Layer Responsibilities

- **`components/`** - React UI (client and server components)
- **`actions/`** - Server actions (`"use server"`) that return discriminated union results (`{ success: true, data } | { success: false, error }`)
- **`services/`** - Business logic, authorization checks, validation. Import `"server-only"`
- **`repositories/`** - Raw Drizzle ORM queries. No business logic
- **`dal/`** (Data Access Layer) - React `cache()`-wrapped functions for session/data retrieval with automatic redirects on auth failure
- **`validation/`** - Zod schemas for input validation
- **`types.ts`** - Error codes as const, TypeScript types, discriminated union types

### Error Handling Pattern

Each feature defines its own error classes and error codes:

```typescript
export const WORKSPACE_ERROR_CODES = { VALIDATION_ERROR: "VALIDATION_ERROR", ... } as const;
export class WorkspaceValidationError extends Error { ... }
```

Server actions catch these errors and return typed error results (never throw to the client).

### Routing Structure

- `src/app/(marketing)/` - Public pages: landing, login, verify-otp
- `src/app/(dashboard)/` - Protected pages: workspace list, workspace views (`/w/[slug]/...`)
- `src/app/api/auth/[...all]/` - Better-auth catch-all API route

### Key Files

- `src/lib/auth.ts` - Better-auth server config (OTP settings, OAuth providers)
- `src/lib/auth-client.ts` - Client-side auth utilities
- `src/db/index.ts` - Database connection (Vercel Postgres)
- `src/db/schema/` - Drizzle table definitions
- `src/middleware.ts` - Auth route protection

## Conventions

- Project documentation and UI text are in **French**
- Features currently implemented: auth (email OTP), workspaces (CRUD). Members, projects, tasks, comments are planned (see `docs/SPEC.md`)
- Workspace members table is scaffolded but commented out in schema - future development
- Tests use `vi.mock()` for dependency isolation with fixture data in `__tests__/` directories
- Server-only code uses the `"server-only"` import to prevent client bundling
