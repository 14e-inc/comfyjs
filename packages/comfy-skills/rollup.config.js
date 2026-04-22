import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const libraryPlugins = [
  resolve(),
  commonjs(),
  typescript({ tsconfig: "./tsconfig.json" }),
];

const cliPlugins = [
  resolve({ preferBuiltins: true }),
  commonjs(),
  typescript({ tsconfig: "./tsconfig.json" }),
];

export default [
  // ESM library build
  {
    input: "src/index.ts",
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
    plugins: libraryPlugins,
  },
  // CJS library build
  {
    input: "src/index.ts",
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
      exports: "auto",
    },
    plugins: libraryPlugins,
  },
  // CLI bundle — fully self-contained, Node built-ins external
  {
    input: "src/cli.ts",
    external: [
      /^node:/,
      "fs", "path", "os", "process", "util", "stream",
      "events", "crypto", "http", "https", "url", "module",
    ],
    output: {
      file: pkg.bin["comfy-skills"],
      format: "cjs",
      exports: "auto",
      banner: "#!/usr/bin/env node",
    },
    plugins: cliPlugins,
  },
];
