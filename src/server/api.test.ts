import { expect, test } from "bun:test";
import { join } from "path";
import { create_api } from "./api";

const FIXTURES_DIR = join(import.meta.dir, "../../fixtures");
const app = create_api(FIXTURES_DIR);

test("GET /sessions returns 200 with array", async () => {
  const res = await app.request("/sessions");
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(Array.isArray(data)).toBe(true);
});

test("GET /sessions returns session index fields", async () => {
  const res = await app.request("/sessions");
  const data = await res.json();
  expect(data.length).toBeGreaterThan(0);
  const session = data[0];
  expect(typeof session.id).toBe("string");
  expect(typeof session.name).toBe("string");
  expect(typeof session.message_count).toBe("number");
  expect(typeof session.tool_calls).toBe("number");
  expect(["complete", "unknown"]).toContain(session.status);
});

test("GET /sessions/:id returns session data for valid id", async () => {
  const res = await app.request("/sessions/sample-session");
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.name).toBe("sample-session");
  expect(Array.isArray(data.messages)).toBe(true);
  expect(data.messages.length).toBeGreaterThan(0);
  expect(data.metadata).toBeDefined();
});

test("GET /sessions/:id returns 404 for unknown id", async () => {
  const res = await app.request("/sessions/nonexistent-session-xyz");
  expect(res.status).toBe(404);
  const data = await res.json();
  expect(data.error).toBeDefined();
});
