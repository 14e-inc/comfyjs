import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const input = "src/index.ts";

const sharedPlugins = [
  resolve(),
  commonjs(),
  typescript({ tsconfig: "./tsconfig.json" }),
];

export default [
  // ESM build
  {
    input,
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
    plugins: sharedPlugins,
  },
  // CJS build
  {
    input,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
      exports: "auto",
    },
    plugins: sharedPlugins,
  },
  // UMD build (minified, for browsers)
  {
    input,
    output: {
      file: pkg.browser,
      format: "umd",
      name: "comfyjs",
      sourcemap: true,
    },
    plugins: [...sharedPlugins, terser()],
  },
];
