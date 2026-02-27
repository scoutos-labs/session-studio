import { describe, it, expect } from "bun:test";
import { parse_role } from "./types";

describe("parse_role", () => {
  it("parses simple roles without identity", () => {
    expect(parse_role("system")).toEqual({ type: "system", identity: undefined });
    expect(parse_role("user")).toEqual({ type: "user", identity: undefined });
    expect(parse_role("agent")).toEqual({ type: "agent", identity: undefined });
  });

  it("parses process_call with tool name", () => {
    expect(parse_role("process_call:read")).toEqual({
      type: "process_call",
      identity: "read",
    });
    expect(parse_role("process_call:bash")).toEqual({
      type: "process_call",
      identity: "bash",
    });
    expect(parse_role("process_call:write")).toEqual({
      type: "process_call",
      identity: "write",
    });
  });

  it("parses process_result with tool name", () => {
    expect(parse_role("process_result:read")).toEqual({
      type: "process_result",
      identity: "read",
    });
    expect(parse_role("process_result:bash")).toEqual({
      type: "process_result",
      identity: "bash",
    });
  });

  it("splits only on the first colon", () => {
    expect(parse_role("process_call:some:tool")).toEqual({
      type: "process_call",
      identity: "some:tool",
    });
  });
});
