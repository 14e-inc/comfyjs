import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

const input = "src/index.js";

const sharedPlugins = [resolve(), commonjs()];

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
