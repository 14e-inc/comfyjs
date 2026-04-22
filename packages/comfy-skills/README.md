# @14e-inc/comfy-skills

Composable skills module for the comfyjs ecosystem. Define typed async skills, register them in a shared registry, and run them from code or the CLI.

Works in any JS runtime (Cloudflare Workers, Node.js, browsers).

---

## Installation

```sh
pnpm add @14e-inc/comfy-skills
```

Or run directly via npx without installing:

```sh
npx @14e-inc/comfy-skills --help
```

---

## Concepts

| Concept | Description |
|---|---|
| `Skill` | An object with `name`, `description`, and an `execute(input)` method |
| `SkillRegistry` | Holds skills by name; runs them by key |
| `globalRegistry` | Module-level singleton registry |

---

## Usage

### Define a skill

```ts
import type { Skill } from '@14e-inc/comfy-skills';

type GreetInput = { name: string };
type GreetOutput = { greeting: string };

export const greetSkill: Skill<GreetInput, GreetOutput> = {
  name: 'greet',
  description: 'Returns a greeting for the given name',
  async execute({ name }) {
    return { greeting: `Hello, ${name}!` };
  },
};
```

### Register and run skills

```ts
import { SkillRegistry } from '@14e-inc/comfy-skills';
import { greetSkill } from './greet';

const registry = new SkillRegistry();
registry.register(greetSkill);

const result = await registry.run('greet', { name: 'world' });
// { greeting: 'Hello, world!' }
```

### Use the global registry

```ts
import { globalRegistry, echoSkill } from '@14e-inc/comfy-skills';

globalRegistry.register(echoSkill);

const out = await globalRegistry.run('echo', { message: 'hi', repeat: 2 });
// { result: 'hi hi', timestamp: '...' }
```

### List registered skills

```ts
registry.list();
// [{ name: 'greet', description: 'Returns a greeting for the given name' }]
```

---

## CLI

The CLI exposes the built-in `echo` skill. Add your own skills by extending the registry in your own binary (see [Extending the CLI](#extending-the-cli)).

```sh
# List registered skills
npx @14e-inc/comfy-skills list

# Run a skill with JSON input
npx @14e-inc/comfy-skills run echo '{"message":"hello","repeat":3}'
```

### Extending the CLI

Create your own binary that registers additional skills:

```ts
// my-skills/src/cli.ts
import { SkillRegistry } from '@14e-inc/comfy-skills';
import { greetSkill } from './greet';

const registry = new SkillRegistry();
registry.register(greetSkill);

// ... handle process.argv
```

---

## API

### `Skill<I, O>`

```ts
interface Skill<I extends SkillInput, O extends SkillOutput> {
  readonly name: string;
  readonly description: string;
  execute(input: I): Promise<O>;
}
```

### `SkillRegistry`

| Method | Description |
|---|---|
| `register(skill)` | Register a skill; throws if name already taken |
| `unregister(name)` | Remove a skill by name |
| `get(name)` | Return a skill or `undefined` |
| `list()` | Return `{ name, description }[]` for all skills |
| `run(name, input)` | Execute a skill by name |
| `size` | Number of registered skills |

---

## Development

```sh
pnpm install
pnpm --filter @14e-inc/comfy-skills build
pnpm --filter @14e-inc/comfy-skills test
```

### Project structure

```
src/
  types.ts          Skill, SkillInput, SkillOutput, SkillDefinition types
  registry.ts       SkillRegistry class + globalRegistry singleton
  example.ts        echoSkill — reference implementation
  cli.ts            npx binary entry point
  index.ts          Public library exports
  __tests__/
    registry.test.ts
    example.test.ts
```

---

## Publishing

This package publishes to GitHub Packages under the `@14e-inc` scope.

```sh
pnpm --filter @14e-inc/comfy-skills publish
```
