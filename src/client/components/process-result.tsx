import { useState } from "react";
import { parse_role } from "../../shared/types";
import type { Message } from "../../shared/types";

const TRUNCATE_LINES = 50;

function content_as_string(content: string | object): string {
  if (typeof content === "string") return content;
  return JSON.stringify(content, null, 2);
}

function TruncatableContent({
  text,
  is_error,
}: {
  text: string;
  is_error: boolean;
}) {
  const lines = text.split("\n");
  const needs_truncation = lines.length > TRUNCATE_LINES;
  const [expanded, set_expanded] = useState(false);

  const visible = needs_truncation && !expanded
    ? lines.slice(0, TRUNCATE_LINES).join("\n")
    : text;

  return (
    <div>
      <pre
        className={`px-3 py-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap ${
          is_error
            ? "text-red-300 bg-red-950/20"
            : "text-neutral-400 bg-neutral-950"
        }`}
      >
        {visible}
        {needs_truncation && !expanded && (
          <span className="text-neutral-600">…</span>
        )}
      </pre>
      {needs_truncation && (
        <button
          onClick={() => set_expanded((v) => !v)}
          className={`w-full px-3 py-1.5 text-xs font-mono border-t text-left transition-colors ${
            is_error
              ? "border-red-800/40 text-red-500/70 hover:text-red-400 bg-red-950/10"
              : "border-neutral-800/70 text-neutral-600 hover:text-neutral-400 bg-neutral-900/50"
          }`}
        >
          {expanded
            ? `↑ collapse (${lines.length} lines)`
            : `↓ show all (${lines.length} lines)`}
        </button>
      )}
    </div>
  );
}

export function ProcessResult({
  msg,
  messages,
}: {
  msg: Message;
  messages?: Message[];
}) {
  const parsed = parse_role(msg.role);
  const tool_name = parsed.identity ?? "unknown";
  const success = msg.exit_code === undefined || msg.exit_code === 0;
  const is_error = !success;
  const content = content_as_string(msg.content);

  // Find the linked call message for context (if messages provided)
  const linked_call = messages?.find(
    (m) => m.call_id === msg.call_id && parse_role(m.role).type === "process_call"
  );
  const linked_tool = linked_call
    ? (parse_role(linked_call.role).identity ?? tool_name)
    : tool_name;

  return (
    <div className="flex gap-3 pl-8">
      <div
        className={`w-1.5 shrink-0 rounded-full mt-1 ${
          is_error ? "bg-red-800" : "bg-neutral-800"
        }`}
      />
      <div
        className={`border rounded-lg overflow-hidden w-full ${
          is_error ? "border-red-800/50" : "border-neutral-800/70"
        }`}
      >
        <div
          className={`px-3 py-2 text-xs font-mono border-b flex items-center gap-2 ${
            is_error
              ? "bg-red-950/30 border-red-800/40 text-red-400/70"
              : "bg-neutral-900/50 border-neutral-800/70 text-neutral-500"
          }`}
        >
          <span className={is_error ? "text-red-500" : "text-teal-500"}>
            {is_error ? "✗" : "✓"}
          </span>
          <span>{linked_tool}</span>
          {is_error && msg.exit_code !== undefined && (
            <span className="text-red-500">exit {msg.exit_code}</span>
          )}
          {msg.call_id && (
            <span className="ml-auto text-neutral-700">{msg.call_id}</span>
          )}
        </div>
        {content && (
          <TruncatableContent text={content} is_error={is_error} />
        )}
      </div>
    </div>
  );
}
