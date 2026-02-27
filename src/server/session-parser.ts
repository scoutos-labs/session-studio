import { basename } from "path";
import type { Message } from "../shared/types";

export interface SessionMetadata {
  name: string;
  message_count: number;
  tool_calls: number;
  started_at: Date;
  status: "complete" | "unknown";
}

export interface SessionData {
  name: string;
  messages: Message[];
  metadata: SessionMetadata;
}

export async function parse_session_file(path: string): Promise<SessionData> {
  const name = basename(path, ".jsonl");

  const text = await Bun.file(path).text();
  const messages: Message[] = text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as Message);

  const tool_calls = messages.filter((m) =>
    m.role.startsWith("process_call:")
  ).length;

  const stat = await Bun.file(path).stat();
  const started_at = new Date(stat.ctimeMs as number);

  const last = messages[messages.length - 1];
  const status: "complete" | "unknown" =
    last && last.role === "agent" && last.done === true ? "complete" : "unknown";

  const metadata: SessionMetadata = {
    name,
    message_count: messages.length,
    tool_calls,
    started_at,
    status,
  };

  return { name, messages, metadata };
}
