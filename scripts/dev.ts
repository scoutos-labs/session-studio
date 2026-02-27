#!/usr/bin/env bun
// Runs hono server + vite dev server concurrently

const server = Bun.spawn(["bun", "run", "src/server/index.ts"], {
  stdout: "inherit",
  stderr: "inherit",
  env: { ...process.env },
});

const vite = Bun.spawn(["bun", "x", "vite"], {
  stdout: "inherit",
  stderr: "inherit",
  env: { ...process.env },
});

process.on("SIGINT", () => {
  server.kill();
  vite.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  server.kill();
  vite.kill();
  process.exit(0);
});

await Promise.all([server.exited, vite.exited]);
