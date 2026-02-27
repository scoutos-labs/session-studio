import { Hono } from "hono";
import { existsSync, statSync } from "fs";
import { join } from "path";
import { create_api } from "./api";

const session_dir = process.env.SESSION_DIR ?? "./sessions";
const port = Number(process.env.PORT ?? 3030);

const app = new Hono();

app.route("/api", create_api(session_dir));

const client_dist = "dist/client";
if (existsSync(client_dist)) {
  app.use("/*", async (c) => {
    const url_path = c.req.path;
    const file_path = join(client_dist, url_path);

    try {
      const stat = statSync(file_path);
      if (stat.isFile()) {
        return new Response(Bun.file(file_path));
      }
    } catch {
      // file not found, fall through to SPA index
    }

    return new Response(Bun.file(join(client_dist, "index.html")));
  });
}

console.log(`Session Studio running on http://localhost:${port}`);
console.log(`Session directory: ${session_dir}`);

export default {
  port,
  fetch: app.fetch,
};
