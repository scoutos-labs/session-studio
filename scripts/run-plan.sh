#!/usr/bin/env bash
#
# run-plan.sh - Execute implementation plan iteratively via claude
#
# Usage: scripts/run-plan.sh [--max-steps N]

set -euo pipefail

MAX_ITERATIONS=25
while [[ $# -gt 0 ]]; do
    case $1 in
        --max-steps) MAX_ITERATIONS="$2"; shift 2 ;;
        --max-steps=*) MAX_ITERATIONS="${1#*=}"; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLAN_PATH="$REPO_ROOT/docs/phase-1-plan.md"

cd "$REPO_ROOT"

if [[ ! -f "$PLAN_PATH" ]]; then
    echo "Error: Plan not found at: $PLAN_PATH"
    exit 1
fi

echo "======================================"
echo "  Session Studio — Plan Executor"
echo "======================================"
echo ""
echo "Plan: $PLAN_PATH"
echo "Max iterations: $MAX_ITERATIONS"
echo "Working directory: $REPO_ROOT"
echo "Model: sonnet"
echo ""

all_tasks_complete() {
    local unchecked
    unchecked=$({ grep -c '^\- \[ \]' "$PLAN_PATH" 2>/dev/null; } || true)
    [[ -z "$unchecked" || "$unchecked" -eq 0 ]]
}

count_remaining_tasks() {
    local count
    count=$({ grep -c '^\- \[ \]' "$PLAN_PATH" 2>/dev/null; } || true)
    echo "${count:-0}"
}

build_prompt() {
    local iteration=$1
    local remaining=$2

    cat <<PROMPT_EOF
# Task: Execute ONE Step of the Session Studio Implementation Plan

You are a disciplined executor. This is iteration $iteration of $MAX_ITERATIONS.

## Context

You are building Session Studio — a rich web interface for visualizing agent-runner sessions. It renders JSONL output from agent-runner as interactive, readable session views.

**Important files:**
- Implementation plan: \`$PLAN_PATH\`
- Project rules: \`$REPO_ROOT/CLAUDE.md\`
- Code directory: \`$REPO_ROOT\`

## Scope: ONE task only

Complete exactly ONE unchecked task from the plan, then commit and STOP.

Do NOT look ahead. Do NOT do "while I'm here" extras. Do NOT combine tasks. ONE task, ONE commit, done.

## Steps

1. Read the plan at \`$PLAN_PATH\`
2. Read CLAUDE.md for project rules
3. Read recent commits: \`git log --oneline -10\`
4. Find the FIRST unchecked task (\`- [ ]\`) — that is your ONLY job
5. Implement that task
6. Run tests if relevant: \`bun test\` (skip if no tests exist yet)
7. Check it off in the plan (\`- [x]\`)
8. Commit: \`type(scope): description [plan N.N]\`
9. STOP immediately

## Commit Rules (CRITICAL)

- Do NOT add Co-Authored-By lines. Ever.
- Do NOT mention Claude, AI, or automated generation.
- Format: \`type(scope): description [plan N.N]\`
- Examples:
  - \`feat(types): wire format types and parser [plan 0.2]\`
  - \`feat(api): session list and detail routes [plan 0.6]\`
  - \`feat(ui): rich tool call rendering [plan 0.11]\`

## Design Direction

- Dark theme: bg-neutral-950, text-neutral-100, card borders in neutral-800
- Accent: teal (#5BA9A4) for interactive elements and status indicators
- Monospace for code/technical content, sans-serif for UI text
- Inspired by Linear, Vercel, Raycast — clean, minimal, professional
- Subtle hover effects, smooth transitions

## Rules

- ONE task per iteration. No exceptions.
- If blocked, note why in commit message, check off anyway, STOP
- Do not skip tasks
- Run \`bun test\` after implementing to verify nothing is broken (if tests exist)

Current state: $remaining tasks remaining
PROMPT_EOF
}

iteration=1
while [[ $iteration -le $MAX_ITERATIONS ]]; do
    remaining=$(count_remaining_tasks)

    if all_tasks_complete; then
        echo ""
        echo "======================================"
        echo "  All tasks complete!"
        echo "======================================"
        echo "Completed in $((iteration - 1)) iterations."
        exit 0
    fi

    echo ""
    echo "--- iteration $iteration/$MAX_ITERATIONS ($remaining tasks remaining) ---"
    echo ""

    prompt=$(build_prompt "$iteration" "$remaining")

    if ! claude --model sonnet --permission-mode bypassPermissions -p "$prompt"; then
        echo "Warning: Agent exited with non-zero status"
    fi

    sleep 2
    ((iteration++))
done

echo ""
echo "Max iterations reached ($MAX_ITERATIONS). $(count_remaining_tasks) tasks remaining."
echo "Run again to continue."
exit 1
