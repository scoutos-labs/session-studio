export type RoleType =
  | "system"
  | "user"
  | "agent"
  | "process_call"
  | "process_result";

export interface ParsedRole {
  type: RoleType;
  identity: string | undefined;
}

export interface Message {
  id: string;
  role: string;
  content: string | object;
  done?: boolean;
  delta?: string;
  call_id?: string;
  exit_code?: number;
}

export function parse_role(role: string): ParsedRole {
  const colon = role.indexOf(":");
  if (colon === -1) {
    return { type: role as RoleType, identity: undefined };
  }
  return {
    type: role.slice(0, colon) as RoleType,
    identity: role.slice(colon + 1),
  };
}
