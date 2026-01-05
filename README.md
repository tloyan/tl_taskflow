# TaskFlow

Gestionnaire de projets en équipe avec workspaces, rôles et vues Kanban/Table.

## Features

- **Workspaces** — Espaces de travail isolés avec leurs propres membres
- **Rôles** — Owner, Admin, Member, Viewer avec permissions granulaires
- **Projets** — Organisation par projet avec couleurs et archivage
- **Tâches** — Statut, priorité, assignation, dates d'échéance
- **Vues** — Kanban (board) et Table avec filtres et recherche
- **Commentaires** — Discussion sur les tâches
- **Auth** — Connexion par email OTP

## Stack

|                 |                         |
| --------------- | ----------------------- |
| Framework       | Next.js 16 (App Router) |
| Langage         | TypeScript (strict)     |
| Base de données | PostgreSQL + Drizzle    |
| Auth            | Better-auth             |
| UI              | Shadcn UI + TailwindCSS |
| Tables          | TanStack Table          |
| Validation      | Zod                     |

## Architecture

Architecture par feature avec séparation des responsabilités.

```
src/
├── app/              # Routes Next.js
├── features/         # Auth, Workspaces, Projects, Tasks, Comments
│   └── [feature]/
│       ├── components/
│       ├── actions/
│       ├── services/
│       ├── repositories/
│       ├── dal/
│       └── dto/
├── shared/           # UI, hooks, utils
└── db/               # Schema Drizzle
```

## Getting Started

```bash
# Install
pnpm install

# Setup env
cp .env.example .env.local

# Database
pnpm db:push

# Dev
pnpm dev
```

## Documentation

- [Spécifications](./docs/SPEC.md) — Wireframes, schéma de données, permissions
- [Architecture](./docs/ARCHITECTURE.md) — Structure détaillée du projet

## License

MIT
