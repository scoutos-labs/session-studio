# Session Studio — Phase 1: Foundation + Basic Session Rendering

**Status:** Ready
**Goal:** Browser at `localhost:3030` → session list → click → rich tool call rendering. Dark theme, clean, functional.

## Stack

- **Server:** Bun + Hono
- **Client:** React + Tailwind CSS + Vite
- **Data:** Read `.jsonl` files from SESSION_DIR env (default: `./sessions`)
- **Deploy:** `bun run start` — single process serves API + static client

## Wire Format Reference

Agent-runner outputs JSONL where each line is a message with:
- `id`: string
- `role`: one of `system`, `user`, `agent`, `process_call:<tool_name>`, `process_result:<tool_name>`
- `content`: string or object
- `done`: boolean (true for complete messages)
- `delta`: string (for streaming partial text)
- `call_id`: string (links process_call to process_result)
- `exit_code`: number (on process_result, 0 = success)

## Tasks

- [x] **0.1** Project scaffold — `bun init`, install deps (hono, @hono/node-server, react, react-dom, react-router-dom, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, vite), create directory structure (src/server, src/client, src/shared, fixtures, scripts, docs), tsconfig.json with strict mode, package.json scripts (dev, build, start, test).

- [x] **0.2** Wire format types — `src/shared/types.ts`: define `Message` interface (id, role, content, done, delta, call_id, exit_code), `ParsedRole` type (type + identity), `parse_role(role: string): ParsedRole` function that splits on first colon. `RoleType` = system | user | agent | process_call | process_result. Unit tests in `src/shared/types.test.ts`.

- [x] **0.3** Sample session fixture — `fixtures/sample-session.jsonl`: a realistic ~30 line agent session. Include: system message, user goal ("implement a fibonacci function"), agent reasoning, process_call:read (reading a file), process_result (file contents), agent reasoning about implementation, process_call:write (writing code), process_result (success), process_call:bash (running tests), process_result (test output with pass), agent summary message. All messages with proper id, role, content, done, call_id fields.

- [x] **0.4** Session parser — `src/server/session-parser.ts`: `parse_session_file(path: string): Promise<SessionData>`. Reads a .jsonl file line by line, parses each as Message. Extracts metadata: name (from filename without extension), message_count, tool_calls (count of process_call messages), started_at (timestamp from first message or file ctime), status ("complete" if last message is agent with done:true, else "unknown"). Returns `{ name, messages, metadata }`. Tests in `src/server/session-parser.test.ts` using the fixture file.

- [x] **0.5** Session discovery — `src/server/sessions.ts`: `discover_sessions(dir: string): Promise<SessionIndex[]>`. Scans directory for *.jsonl files, calls parse_session_file for each, returns array of `SessionIndex` objects (id, name, started_at, message_count, tool_calls, status) sorted by started_at descending. `SessionIndex` is the metadata without messages. Tests in `src/server/sessions.test.ts`.

- [x] **0.6** API routes — `src/server/api.ts`: Hono router with `GET /api/sessions` (returns session index array as JSON) and `GET /api/sessions/:id` (returns full session with messages, 404 if not found). Wire up session discovery and parser. Tests in `src/server/api.test.ts` — use Hono's test helper or direct fetch against the app.

- [x] **0.7** Server entrypoint — `src/server/index.ts`: create Hono app, mount API routes under /api, serve static files from `dist/client` in production (check if directory exists). Read SESSION_DIR from env (default: `./sessions`), PORT from env (default: 3030). Console log on startup with port and session dir.

- [x] **0.8** Vite + React client shell — `vite.config.ts` with React plugin, Tailwind CSS plugin, output to `dist/client`. `src/client/index.html` as entry. `src/client/main.tsx` renders App. `src/client/App.tsx` with react-router: `/` → SessionList, `/sessions/:id` → SessionDetail. `src/client/index.css` with Tailwind directives and dark theme base styles (bg-neutral-950, text-neutral-100). Proxy `/api` to `http://localhost:3030` in dev mode.

- [x] **0.9** Session list page — `src/client/pages/session-list.tsx`: fetch `/api/sessions` on mount, render as a list of cards. Each card shows: session name (mono font), started_at (relative time like "2 hours ago"), message count, tool call count, status badge (green dot for complete, yellow for running, gray for unknown). Click navigates to `/sessions/:id`. Empty state if no sessions. Subtle card borders, hover effects.

- [x] **0.10** Session detail page (basic) — `src/client/pages/session-detail.tsx`: fetch `/api/sessions/:id`, render messages in order as a vertical timeline. Agent messages: left-aligned text blocks with a subtle background. Process calls: labeled cards showing tool name. Process results: indented under their call. Back button to session list. Loading and error states.

- [x] **0.11** Rich tool call rendering — `src/client/components/process-call.tsx`: detect tool type from ParsedRole identity. `read` calls: show file path as header, content in a code block with monospace font. `bash` calls: show command in a terminal-styled block (dark bg, green text). `write`/`edit` calls: show file path + content. `grep`/`glob` calls: show pattern + results. Unknown tools: generic card with JSON content. Agent reasoning text: collapsible with chevron toggle, collapsed by default if longer than 3 lines.

- [x] **0.12** Process result rendering — `src/client/components/process-result.tsx`: match result to its call via call_id. Show success (green check) or failure (red x) based on exit_code. Content rendering: code/terminal output in monospace blocks. Truncate content longer than 50 lines with "Show more" toggle. Error results get a red-tinted background.

- [x] **0.13** Session header component — `src/client/components/session-header.tsx`: displayed at top of session detail. Shows session name, status badge, total duration (if calculable from timestamps), message count, tool call breakdown (e.g., "12 reads, 5 writes, 3 bash"). Breadcrumb: "Sessions / session-name". Sticky at top on scroll.

- [x] **0.14** Build and serve — Ensure `bun run build` compiles the client with vite and bundles the server. `bun run start` runs the server which serves both API and static client from a single port. `bun run dev` runs vite dev server + hono server concurrently (use a simple script or `concurrently` package). Verify: build clean, start serves at :3030, dev mode works with HMR. Copy fixtures/sample-session.jsonl to sessions/ directory for default demo data.

- [x] **0.15** README — README.md with: project description (one paragraph), screenshot placeholder, quick start (3 commands: clone, install, start), configuration (SESSION_DIR, PORT env vars), development setup (bun run dev), how to add sessions (point SESSION_DIR at your .jsonl files), tech stack summary, link to agent-runner.
