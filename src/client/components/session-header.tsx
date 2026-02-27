import { parse_role } from "../../shared/types";
import type { Message } from "../../shared/types";

interface SessionMetadata {
  name: string;
  message_count: number;
  tool_calls: number;
  started_at: string;
  status: "complete" | "unknown";
}

interface SessionHeaderProps {
  name: string;
  metadata: SessionMetadata;
  messages: Message[];
  on_back: () => void;
}

function compute_tool_breakdown(messages: Message[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const msg of messages) {
    const parsed = parse_role(msg.role);
    if (parsed.type === "process_call" && parsed.identity) {
      counts[parsed.identity] = (counts[parsed.identity] ?? 0) + 1;
    }
  }
  return counts;
}

function StatusBadge({ status }: { status: "complete" | "unknown" }) {
  const is_complete = status === "complete";
  return (
    <span
      className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${
        is_complete
          ? "text-teal-400 border-teal-800/50 bg-teal-950/30"
          : "text-neutral-500 border-neutral-800 bg-neutral-900/30"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${is_complete ? "bg-teal-400" : "bg-neutral-500"}`}
      />
      {status}
    </span>
  );
}

export function SessionHeader({ name, metadata, messages, on_back }: SessionHeaderProps) {
  const breakdown = compute_tool_breakdown(messages);
  const breakdown_parts = Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => `${count} ${tool}`);

  return (
    <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-6 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
          <button
            onClick={on_back}
            className="hover:text-neutral-300 transition-colors"
          >
            Sessions
          </button>
          <span>/</span>
          <span className="text-neutral-300 font-mono">{name}</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-lg font-mono font-semibold text-neutral-100">{name}</h1>
          <StatusBadge status={metadata.status} />
        </div>

        <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
          <span>{metadata.message_count} messages</span>
          {breakdown_parts.length > 0 && (
            <span>{breakdown_parts.join(", ")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
