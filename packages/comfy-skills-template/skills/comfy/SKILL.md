---
name: comfy
version: 0.1.0
description: Example skill demonstrating MCP tool exposure and AgentSkills.io conventions
author: 14e Inc.
license: MIT
triggers:
  - hello world
  - greet
  - mcp demo
tools:
  - hello_world
runtime:
  transport: stdio
  entry: ../../dist/index.mjs
---

# Comfy Skill

An example AgentSkills.io-compliant skill distributed via [skills-npm](https://github.com/antfu/skills-npm) discovery and surfaced over the Model Context Protocol.

## Triggers

Activate this skill when the user:

- Asks for a "hello world" interaction or an MCP demo.
- Says *"greet <name>"*, *"say hello to <name>"*, or similar.
- Is exploring available MCP tools and requests a canonical reference.

## Instructions

1. **Discover the tool.** Call the `hello_world` tool exposed by this skill's MCP server. The server is started from `dist/index.mjs` (see `runtime.entry` above) over `stdio` transport.
2. **Validate input.** The tool enforces a Zod schema: `{ name: string, non-empty }`. Reject or repair input before calling.
3. **Interpret output.** The response is an MCP text-content block: `{ content: [{ type: 'text', text: 'Hello, <name>!' }] }`. Surface the `text` field directly to the user.
4. **Errors.** Any Zod validation failure is returned through MCP's error channel. Retry only after correcting the offending field.

## Tools

### `hello_world`

| Field | Value |
|-------|-------|
| Name | `hello_world` |
| Input | `{ name: string }` (non-empty) |
| Output | `{ content: [{ type: 'text', text: string }] }` |
| Side effects | None |

Greets the given name. Canonical reference implementation — copy this pattern when adding new tools.

## References

Progressive disclosure: extended documentation lives alongside this manifest.

- [`references/`](./references/) — Protocol deep-dives, schema rationale, and extended examples.
- [`scripts/`](./scripts/) — Helper scripts (invocation snippets, fixture generators, smoke runners).

Both directories are intentionally empty in the template and populated per-skill by the consuming package.

## Contract for Modifiers

Any agent or human editing this skill must preserve:

1. The filename `SKILL.md` and its presence under `skills/<name>/`.
2. The `name`, `version`, `description`, and `tools` frontmatter keys.
3. Alignment between `tools[]` here and the tools registered in `src/index.ts::createServer`.

See the repo-root [`AGENTS.md`](../../AGENTS.md) for full generator-readiness invariants.
