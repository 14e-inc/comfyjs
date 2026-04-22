import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const input = "src/index.ts";

const external = ["jose", "@14e-inc/comfy-auth-util"];

const plugins = [
  resolve(),
  commonjs(),
  typescript({ tsconfig: "./tsconfig.json" }),
];

export default [
  {
    input,
    external,
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
    plugins,
  },
  {
    input,
    external,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
      exports: "auto",
    },
    plugins,
  },
];
