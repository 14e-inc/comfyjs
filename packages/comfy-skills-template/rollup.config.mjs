import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  /^@modelcontextprotocol\/sdk\//,
  /^node:/,
];

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.mjs',
    format: 'esm',
    sourcemap: true,
    banner: '#!/usr/bin/env node',
  },
  external,
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/__tests__/**', '**/*.test.ts'],
      declaration: true,
      declarationMap: true,
      outDir: 'dist',
    }),
  ],
};
