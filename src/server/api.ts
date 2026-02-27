import { Hono } from "hono";
import { join } from "path";
import { discover_sessions } from "./sessions";
import { parse_session_file } from "./session-parser";

export function create_api(session_dir: string): Hono {
  const app = new Hono();

  app.get("/sessions", async (c) => {
    const sessions = await discover_sessions(session_dir);
    return c.json(sessions);
  });

  app.get("/sessions/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const data = await parse_session_file(join(session_dir, `${id}.jsonl`));
      return c.json(data);
    } catch {
      return c.json({ error: "Session not found" }, 404);
    }
  });

  return app;
}
