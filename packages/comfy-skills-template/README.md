# @comfy/skills-template

> Reference implementation of a single-skill, MCP-ready TypeScript package
> conforming to [AgentSkills.io](https://agentskills.io/) and the
> [antfu/skills-npm](https://github.com/antfu/skills-npm) discovery paradigm.

This package does double duty:

1. It's a real, installable, passing-tests package — clone it and you have a working MCP skill.
2. It's the high-fidelity template that `@14e-inc/generator-comfy-skill` produces. See [`AGENTS.md`](./AGENTS.md) for the generator contract.

## Install

```sh
pnpm add @comfy/skills-template
```

## Layout

```
.
├── skills/comfy/SKILL.md      AgentSkills manifest (frontmatter + protocol docs)
├── src/index.ts               MCP server + hello_world tool
├── src/types.ts               Zod input/output schemas
├── src/__tests__/             90%+ coverage gate
├── dist/index.mjs             Rollup output (ESM + shebang)
└── AGENTS.md                  Modifier contract — read before editing
```

## Use as a library

```ts
import { createServer, helloWorld } from '@comfy/skills-template';

// Pure logic, unit-testable.
helloWorld({ name: 'Ada' });
// → { greeting: 'Hello, Ada!' }

// Configured MCP server ready to attach to any transport.
const server = createServer();
```

## Use as a binary (stdio MCP server)

The `bin.comfy-skill` entry launches the MCP server over stdio:

```sh
npx comfy-skill
```

Any MCP client can now discover the `hello_world` tool.

## Development

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Typecheck | `pnpm run typecheck` |
| Test (with 90% coverage gate) | `pnpm run test` |
| Test (watch) | `pnpm run test:watch` |
| Build | `pnpm run build` |
| Clean | `pnpm run clean` |

CI runs typecheck → test → build on every push and PR. See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## Protocol & discovery

- **SKILL.md** — AgentSkills spec. Frontmatter declares `name`, `version`, `tools`, and stdio entry point.
- **`package.json → agentskills.skills[]`** — skills-npm discovery manifest. Consumer tooling reads this field to locate skill bundles inside the package.
- **MCP** — tools surfaced via `@modelcontextprotocol/sdk` over stdio.

## License

MIT
