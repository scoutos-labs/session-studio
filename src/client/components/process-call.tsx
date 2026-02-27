import { useState } from "react";
import { parse_role } from "../../shared/types";
import type { Message } from "../../shared/types";

function parse_obj(content: string | object): Record<string, unknown> | string {
  if (typeof content === "object" && content !== null) {
    return content as Record<string, unknown>;
  }
  if (typeof content === "string") {
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return content;
    }
  }
  return String(content);
}

function str(val: unknown): string {
  if (typeof val === "string") return val;
  if (val === undefined || val === null) return "";
  return JSON.stringify(val, null, 2);
}

function ReadCall({ content }: { content: string | object }) {
  const parsed = parse_obj(content);
  const path = typeof parsed === "object" ? str(parsed.path) : parsed;
  return (
    <div className="px-3 py-3 text-xs font-mono text-neutral-300 bg-neutral-950 overflow-x-auto whitespace-pre-wrap">
      <span className="text-neutral-500">read </span>
      <span className="text-teal-300">{path}</span>
    </div>
  );
}

function BashCall({ content }: { content: string | object }) {
  const parsed = parse_obj(content);
  const command = typeof parsed === "object" ? str(parsed.command) : parsed;
  return (
    <div className="px-3 py-3 bg-neutral-950 overflow-x-auto">
      <span className="text-xs font-mono text-green-400/70">$ </span>
      <span className="text-xs font-mono text-green-300 whitespace-pre-wrap">{command}</span>
    </div>
  );
}

function WriteCall({ content }: { content: string | object }) {
  const parsed = parse_obj(content);
  const path = typeof parsed === "object" ? str(parsed.path) : "";
  const body = typeof parsed === "object" ? str(parsed.content) : typeof parsed === "string" ? parsed : "";
  return (
    <div className="bg-neutral-950 overflow-hidden">
      {path && (
        <div className="px-3 py-2 border-b border-neutral-800 text-xs font-mono text-teal-300">
          {path}
        </div>
      )}
      {body && (
        <pre className="px-3 py-3 text-xs font-mono text-neutral-300 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
          {body}
        </pre>
      )}
    </div>
  );
}

function GrepCall({ content }: { content: string | object }) {
  const parsed = parse_obj(content);
  if (typeof parsed === "string") {
    return (
      <pre className="px-3 py-3 text-xs font-mono text-neutral-300 bg-neutral-950 whitespace-pre-wrap">
        {parsed}
      </pre>
    );
  }
  const pattern = str(parsed.pattern);
  const path = str(parsed.path ?? parsed.glob ?? "");
  return (
    <div className="px-3 py-3 bg-neutral-950 text-xs font-mono">
      <div>
        <span className="text-neutral-500">pattern </span>
        <span className="text-yellow-300">{pattern}</span>
      </div>
      {path && (
        <div className="mt-1">
          <span className="text-neutral-500">in </span>
          <span className="text-neutral-300">{path}</span>
        </div>
      )}
    </div>
  );
}

function GlobCall({ content }: { content: string | object }) {
  const parsed = parse_obj(content);
  const pattern = typeof parsed === "object" ? str(parsed.pattern ?? parsed.glob) : parsed;
  return (
    <div className="px-3 py-3 bg-neutral-950 text-xs font-mono">
      <span className="text-neutral-500">glob </span>
      <span className="text-yellow-300">{pattern}</span>
    </div>
  );
}

function UnknownCall({ content }: { content: string | object }) {
  const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  return (
    <pre className="px-3 py-3 text-xs font-mono text-neutral-300 bg-neutral-950 overflow-x-auto whitespace-pre-wrap">
      {text}
    </pre>
  );
}

export function ProcessCall({ msg }: { msg: Message }) {
  const parsed = parse_role(msg.role);
  const tool = parsed.identity ?? "unknown";

  function body() {
    switch (tool) {
      case "read":
        return <ReadCall content={msg.content} />;
      case "bash":
        return <BashCall content={msg.content} />;
      case "write":
      case "edit":
        return <WriteCall content={msg.content} />;
      case "grep":
        return <GrepCall content={msg.content} />;
      case "glob":
        return <GlobCall content={msg.content} />;
      default:
        return <UnknownCall content={msg.content} />;
    }
  }

  return (
    <div className="flex gap-3 pl-4">
      <div className="w-1.5 shrink-0 bg-neutral-700 rounded-full mt-1" />
      <div className="border border-neutral-800 rounded-lg overflow-hidden w-full">
        <div className="bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-400 border-b border-neutral-800 flex items-center gap-2">
          <span className="text-neutral-500">call</span>
          <span className="text-teal-400">{tool}</span>
          {msg.call_id && (
            <span className="ml-auto text-neutral-600">{msg.call_id}</span>
          )}
        </div>
        {body()}
      </div>
    </div>
  );
}

export function CollapsibleAgentText({ text }: { text: string }) {
  const lines = text.split("\n");
  const is_long = lines.length > 3;
  const [expanded, set_expanded] = useState(!is_long);

  if (!is_long) {
    return (
      <div className="text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed">
        {text}
      </div>
    );
  }

  const preview = lines.slice(0, 3).join("\n");

  return (
    <div>
      <div className="text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed">
        {expanded ? text : preview}
        {!expanded && <span className="text-neutral-600">…</span>}
      </div>
      <button
        onClick={() => set_expanded((v) => !v)}
        className="mt-2 flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <span
          className="transition-transform duration-150"
          style={{ display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ›
        </span>
        <span>{expanded ? "collapse" : "expand"}</span>
      </button>
    </div>
  );
}
