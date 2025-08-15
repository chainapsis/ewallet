import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { dts } from "rollup-plugin-dts";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    // {
    //   file: "dist/index.min.js",
    //   format: "esm",
    //   sourcemap: true,
    //   plugins: [terser()],
    // },
  ],
  external: ["@keplr-ewallet/stdlib-js", "@keplr-wallet/types"],
  plugins: [
    nodeResolve(),
    // commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
    }),
    // dts(),
  ],
};
