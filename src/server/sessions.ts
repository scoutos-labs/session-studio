import { readdir } from "fs/promises";
import { join } from "path";
import { parse_session_file } from "./session-parser";
import type { SessionMetadata } from "./session-parser";

export interface SessionIndex {
  id: string;
  name: string;
  started_at: Date;
  message_count: number;
  tool_calls: number;
  status: SessionMetadata["status"];
}

export async function discover_sessions(dir: string): Promise<SessionIndex[]> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const jsonl_files = entries.filter((f) => f.endsWith(".jsonl"));

  const results = await Promise.all(
    jsonl_files.map(async (file): Promise<SessionIndex | null> => {
      try {
        const { metadata } = await parse_session_file(join(dir, file));
        return {
          id: metadata.name,
          name: metadata.name,
          started_at: metadata.started_at,
          message_count: metadata.message_count,
          tool_calls: metadata.tool_calls,
          status: metadata.status,
        };
      } catch {
        return null;
      }
    })
  );

  return results
    .filter((s): s is SessionIndex => s !== null)
    .sort((a, b) => b.started_at.getTime() - a.started_at.getTime());
}
