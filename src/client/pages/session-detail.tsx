import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parse_role } from "../../shared/types";
import type { Message } from "../../shared/types";
import { ProcessCall, CollapsibleAgentText } from "../components/process-call";
import { ProcessResult } from "../components/process-result";
import { SessionHeader } from "../components/session-header";

interface SessionData {
  name: string;
  messages: Message[];
  metadata: {
    name: string;
    message_count: number;
    tool_calls: number;
    started_at: string;
    status: "complete" | "unknown";
  };
}

function content_as_string(content: string | object): string {
  if (typeof content === "string") return content;
  return JSON.stringify(content, null, 2);
}

function SystemMessage({ msg }: { msg: Message }) {
  return (
    <div className="text-xs text-neutral-500 font-mono px-3 py-2 border border-neutral-800/50 rounded bg-neutral-900/30 italic">
      {content_as_string(msg.content)}
    </div>
  );
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 shrink-0 bg-neutral-600 rounded-full mt-1" />
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-neutral-200 whitespace-pre-wrap">
        {content_as_string(msg.content)}
      </div>
    </div>
  );
}

function AgentMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 shrink-0 bg-teal-500 rounded-full mt-1" />
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg px-4 py-3">
        <CollapsibleAgentText text={content_as_string(msg.content)} />
      </div>
    </div>
  );
}

function ProcessCallMessage({ msg }: { msg: Message }) {
  return <ProcessCall msg={msg} />;
}

function ProcessResultMessage({ msg, messages }: { msg: Message; messages: Message[] }) {
  return <ProcessResult msg={msg} messages={messages} />;
}

function MessageRow({ msg, messages }: { msg: Message; messages: Message[] }) {
  const parsed = parse_role(msg.role);
  switch (parsed.type) {
    case "system":
      return <SystemMessage msg={msg} />;
    case "user":
      return <UserMessage msg={msg} />;
    case "agent":
      return <AgentMessage msg={msg} />;
    case "process_call":
      return <ProcessCallMessage msg={msg} />;
    case "process_result":
      return <ProcessResultMessage msg={msg} messages={messages} />;
    default:
      return null;
  }
}

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/sessions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SessionData>;
      })
      .then(setSession)
      .catch((err: unknown) => setError(String(err)));
  }, [id]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {session !== null && (
        <SessionHeader
          name={session.name}
          metadata={session.metadata}
          messages={session.messages}
          on_back={() => navigate("/")}
        />
      )}

      <div className="max-w-3xl mx-auto px-6 py-12">
        {error && (
          <div className="text-red-400 text-sm bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {session === null && !error && (
          <div className="text-neutral-500 text-sm">Loading...</div>
        )}

        {session !== null && (
          <div className="flex flex-col gap-3">
            {session.messages.map((msg) => (
              <MessageRow key={msg.id} msg={msg} messages={session.messages} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
