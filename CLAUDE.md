# Project Rules

## Git & Attribution

- **No AI attribution.** Never add `Co-Authored-By` lines to commits. Never mention Claude, AI, or automated generation in commit messages or code comments.
- **Commit format:** `type(scope): description [plan N.N]` — conventional commits with plan task reference.
- **Author:** Commits are authored as Dottie Weaver <dottie@tnez.dev>. This is already configured in git.

## Code Style

- `snake_case` in code, `kebab-case` in file/folder names
- TypeScript strict mode
- Co-locate unit tests (e.g., `types.test.ts` next to `types.ts`)
- Clarity over cleverness
- Minimal dependencies — prefer built-in Bun/Web APIs

## Stack

- **Server:** Bun + Hono
- **Client:** React + Tailwind CSS + Vite
- **Data:** .jsonl files from SESSION_DIR (filesystem, no database)
- **Deploy:** Single process — `bun run start` serves API + static client
