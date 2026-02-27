import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SessionIndex {
  id: string;
  name: string;
  started_at: string;
  message_count: number;
  tool_calls: number;
  status: "complete" | "unknown";
}

function relative_time(date_str: string): string {
  const date = new Date(date_str);
  const diff_ms = Date.now() - date.getTime();
  const diff_secs = Math.floor(diff_ms / 1000);
  const diff_mins = Math.floor(diff_secs / 60);
  const diff_hours = Math.floor(diff_mins / 60);
  const diff_days = Math.floor(diff_hours / 24);

  if (diff_secs < 60) return "just now";
  if (diff_mins < 60) return `${diff_mins} minute${diff_mins === 1 ? "" : "s"} ago`;
  if (diff_hours < 24) return `${diff_hours} hour${diff_hours === 1 ? "" : "s"} ago`;
  return `${diff_days} day${diff_days === 1 ? "" : "s"} ago`;
}

function StatusBadge({ status }: { status: SessionIndex["status"] }) {
  if (status === "complete") {
    return (
      <span className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-teal-400" />
        <span className="text-xs text-neutral-400">complete</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 shrink-0">
      <span className="w-2 h-2 rounded-full bg-neutral-500" />
      <span className="text-xs text-neutral-400">unknown</span>
    </span>
  );
}

export function SessionList() {
  const [sessions, setSessions] = useState<SessionIndex[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SessionIndex[]>;
      })
      .then(setSessions)
      .catch((err: unknown) => setError(String(err)));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold mb-8">Sessions</h1>

        {error && (
          <div className="text-red-400 text-sm bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {sessions === null && !error && (
          <div className="text-neutral-500 text-sm">Loading...</div>
        )}

        {sessions !== null && sessions.length === 0 && (
          <div className="text-neutral-500 text-sm border border-neutral-800 rounded-lg px-6 py-12 text-center">
            No sessions found. Point{" "}
            <code className="font-mono text-neutral-300">SESSION_DIR</code> at a
            directory with .jsonl files.
          </div>
        )}

        {sessions !== null && sessions.length > 0 && (
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => (
              <li key={session.id}>
                <button
                  onClick={() => navigate(`/sessions/${session.id}`)}
                  className="w-full text-left border border-neutral-800 rounded-lg px-5 py-4 hover:border-neutral-700 hover:bg-neutral-900/50 transition-colors duration-150 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-sm text-neutral-100 group-hover:text-white transition-colors">
                      {session.name}
                    </span>
                    <StatusBadge status={session.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                    <span>{relative_time(session.started_at)}</span>
                    <span>{session.message_count} messages</span>
                    <span>{session.tool_calls} tool calls</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
