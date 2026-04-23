# AGENTS.md — Modifier Contract for `@comfy/skills-template`

> This file is a load-bearing contract. Future agents (human or AI) edit this
> template in a way that preserves its **generator-ready** state. Break an
> invariant below and the Yeoman generator that consumes this template, or the
> AgentSkills.io / skills-npm discovery, will silently break downstream.

## 1. Purpose

This package is the high-fidelity source of truth for skill packages scaffolded
by the `@14e-inc/generator-comfy-skill` Yeoman generator. It is simultaneously:

- A **working, installable, testable package** (a real reference implementation).
- A **template** whose select fields are substituted by the generator.

## 2. Invariants — Do Not Break

### 2.1 Directory layout

```
packages/comfy-skills-template/
├── package.json                # `agentskills` + `_templateFields` required
├── rollup.config.mjs           # output must stay `dist/index.mjs`
├── src/
│   ├── index.ts                # library + bin entry (single Rollup input)
│   ├── types.ts                # Zod schemas
│   └── __tests__/              # colocated, covered by Vitest
├── skills/
│   └── comfy/                  # *** name matches agentskills.skills[0].name ***
│       ├── SKILL.md            # AgentSkills manifest (frontmatter required)
│       ├── references/         # progressive disclosure (extended docs)
│       └── scripts/            # progressive disclosure (helpers)
└── .github/workflows/ci.yml
```

Renaming `skills/comfy/` to anything else **must** be done in lockstep with:

- `package.json → agentskills.skills[0].{name, path}`
- `package.json → _templateFields.agentskills.skills[0].*`
- The frontmatter `name:` in `skills/<name>/SKILL.md`
- The Yeoman generator's `skillSlug` substitution logic

### 2.2 Discovery metadata (skills-npm)

`package.json → agentskills.skills` is the contract with `skills-npm`-style
discovery. Every entry **must** correspond to a real directory with a
`SKILL.md` at its root.

### 2.3 Build output

`rollup.config.mjs` **must** emit a single ESM file at `dist/index.mjs` with a
`#!/usr/bin/env node` shebang. The `package.json → bin.comfy-skill` and `main`
fields both depend on this path; changing the output path is a breaking change
for consumers that resolve the bin.

### 2.4 Test coverage floor

`vitest.config.ts` enforces **90% on lines / functions / branches / statements**.
Do not lower thresholds to make a failing PR green — add tests instead. To
intentionally exclude code from coverage, use `/* v8 ignore start */ … /* v8 ignore stop */`
**and** annotate why in a trailing comment on the same line.

### 2.5 MCP tool ↔ SKILL.md synchronization

Every tool registered by `src/index.ts::createServer` must be listed in
`skills/comfy/SKILL.md → frontmatter.tools` **and** documented in the
`## Tools` section. The test suite does not automatically cross-check this —
human/agent review is the gate.

## 3. Generator Contract

The Yeoman generator that consumes this template will EJS-substitute the
following paths. Keep this section aligned with what lives under
`package.json → _templateFields`:

| Field path | Template expression |
|------------|---------------------|
| `package.json::name` | `<%= scope %>/<%= packageSlug %>` |
| `package.json::description` | `<%= description %>` |
| `package.json::author` | `<%= authorName %> <<%= authorEmail %>>` |
| `package.json::agentskills.skills[0].name` | `<%= skillSlug %>` |
| `package.json::agentskills.skills[0].path` | `./skills/<%= skillSlug %>` |
| `skills/<slug>/SKILL.md::frontmatter.name` | `<%= skillSlug %>` |
| `skills/<slug>/SKILL.md::frontmatter.description` | `<%= skillDescription %>` |
| Directory rename | `skills/comfy/` → `skills/<%= skillSlug %>/` |

The `_templateFields` block in `package.json` is the **single source of truth**
for this mapping. Never document a substitution only in prose — always update
`_templateFields` so the generator can be regenerated from data.

## 4. Modification Playbook

When you need to…

- **Add a new MCP tool** → add a pure function + handler in `src/index.ts`,
  register it on the server, add corresponding Zod schemas to `src/types.ts`,
  add a row under `## Tools` in `SKILL.md`, update `frontmatter.tools`, add
  unit tests targeting the pure function AND the handler envelope.
- **Rename the example skill** → see §2.1 lockstep list.
- **Bump MCP SDK** → run tests; the `server.tool(name, description, shape, handler)`
  signature is version-sensitive. If it breaks, adapt the call site and update
  this file.
- **Publish** → `pnpm run build` then `pnpm run prepublishOnly` runs the build
  again as a safety net. Publishing happens via the top-level Makefile
  (`make publish-skills` / `publish-all`).

## 5. What Lives Outside This File

- **Repo-level architecture** → root `README.md` + `AGENTS.md`.
- **Generator internals** → `packages/generator-comfy-skill/AGENTS.md` (if present)
  or its `README.md`.
- **Publishing flow** → root `Makefile` help output (`make help`).
