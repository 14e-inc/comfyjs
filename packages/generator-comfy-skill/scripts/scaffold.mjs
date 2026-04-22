#!/usr/bin/env node
/**
 * Runs the generator locally into a destination directory without needing
 * a global `yo` install. Uses yeoman-environment's programmatic API.
 *
 * Usage:
 *   node scripts/scaffold.mjs              # temp dir (printed on exit)
 *   node scripts/scaffold.mjs ./my-output  # specific directory
 *   SCAFFOLD_DEST=./my-output pnpm scaffold
 */
import { createEnv } from 'yeoman-environment';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const destArg = process.argv[2] ?? process.env.SCAFFOLD_DEST;
const dest = destArg
  ? resolve(destArg)
  : mkdtempSync(`${tmpdir()}/scaffold-comfy-`);

mkdirSync(dest, { recursive: true });

const generatorPath = resolve(__dirname, '..', 'generators', 'app', 'index.js');

console.log(`\n→ Generator: ${generatorPath}`);
console.log(`→ Output:    ${dest}\n`);

const env = createEnv({ cwd: dest });
await env.register(generatorPath, 'comfy:app');
await env.run('comfy:app');

console.log(`\n✓ Scaffolded into ${dest}`);
