import { expect, test } from "bun:test";
import { join } from "path";
import { discover_sessions } from "./sessions";

const FIXTURES_DIR = join(import.meta.dir, "../../fixtures");

test("discover_sessions returns array from fixtures dir", async () => {
  const sessions = await discover_sessions(FIXTURES_DIR);
  expect(Array.isArray(sessions)).toBe(true);
  expect(sessions.length).toBeGreaterThan(0);
});

test("discover_sessions returns SessionIndex with required fields", async () => {
  const sessions = await discover_sessions(FIXTURES_DIR);
  for (const s of sessions) {
    expect(typeof s.id).toBe("string");
    expect(typeof s.name).toBe("string");
    expect(s.started_at).toBeInstanceOf(Date);
    expect(typeof s.message_count).toBe("number");
    expect(typeof s.tool_calls).toBe("number");
    expect(["complete", "unknown"]).toContain(s.status);
  }
});

test("discover_sessions finds sample-session fixture", async () => {
  const sessions = await discover_sessions(FIXTURES_DIR);
  const found = sessions.find((s) => s.name === "sample-session");
  expect(found).toBeDefined();
  expect(found!.message_count).toBeGreaterThan(0);
  expect(found!.tool_calls).toBeGreaterThan(0);
  expect(found!.status).toBe("complete");
});

test("discover_sessions returns empty array for missing directory", async () => {
  const sessions = await discover_sessions("/nonexistent/path/xyz");
  expect(sessions).toEqual([]);
});

test("discover_sessions returns empty array for directory with no jsonl files", async () => {
  const sessions = await discover_sessions(join(import.meta.dir, "../../docs"));
  expect(sessions).toEqual([]);
});

test("discover_sessions sorts by started_at descending", async () => {
  const sessions = await discover_sessions(FIXTURES_DIR);
  for (let i = 1; i < sessions.length; i++) {
    expect(sessions[i - 1].started_at.getTime()).toBeGreaterThanOrEqual(
      sessions[i].started_at.getTime()
    );
  }
});
