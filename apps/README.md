# Robot Trade Monorepo

This repository is organized as a small full-stack monorepo with three main projects:

- `api/` — Node.js backend, Express server, PocketBase integration
- `web/` — React frontend using Vite and Tailwind CSS
- `pocketbase/` — PocketBase instance with migrations and hooks

## Quick start

1. Copy `.env.example` to `.env` and update credentials.
2. Run `npm install` from the repository root.
3. Start the frontend: `npm run dev:web`
4. Start the backend: `npm run dev:api`
5. Start the local PocketBase server: `npm run dev:db`

## Structure

- `api/src/` — backend source files
- `web/src/` — frontend source files and components
- `web/public/` — public assets, robots, sitemap
- `pocketbase/pb_hooks/` — PocketBase hook scripts
- `pocketbase/pb_migrations/` — database migrations

## Notes

- Keep `.env` private and do not commit it.
- `pocketbase/pb_data/` is ignored in `.gitignore` because it contains local DB files.
