import { expect, test } from "bun:test";
import { join } from "path";
import { parse_session_file } from "./session-parser";

const FIXTURE_PATH = join(import.meta.dir, "../../fixtures/sample-session.jsonl");

test("parse_session_file returns correct name", async () => {
  const data = await parse_session_file(FIXTURE_PATH);
  expect(data.name).toBe("sample-session");
});

test("parse_session_file parses all messages", async () => {
  const data = await parse_session_file(FIXTURE_PATH);
  expect(data.messages.length).toBeGreaterThan(0);
  expect(data.metadata.message_count).toBe(data.messages.length);
});

test("parse_session_file counts tool calls correctly", async () => {
  const data = await parse_session_file(FIXTURE_PATH);
  const expected = data.messages.filter((m) =>
    m.role.startsWith("process_call:")
  ).length;
  expect(data.metadata.tool_calls).toBe(expected);
  expect(data.metadata.tool_calls).toBeGreaterThan(0);
});

test("parse_session_file extracts started_at as a Date", async () => {
  const data = await parse_session_file(FIXTURE_PATH);
  expect(data.metadata.started_at).toBeInstanceOf(Date);
  expect(data.metadata.started_at.getTime()).toBeGreaterThan(0);
});

test("parse_session_file detects complete status", async () => {
  const data = await parse_session_file(FIXTURE_PATH);
  expect(data.metadata.status).toBe("complete");
});

test("parse_session_file returns name in metadata matching root name", async () => {
  const data = await parse_session_file(FIXTURE_PATH);
  expect(data.metadata.name).toBe(data.name);
});

test("parse_session_file messages have required fields", async () => {
  const data = await parse_session_file(FIXTURE_PATH);
  for (const msg of data.messages) {
    expect(typeof msg.id).toBe("string");
    expect(typeof msg.role).toBe("string");
    expect(msg.content).toBeDefined();
  }
});
