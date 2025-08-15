import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { dts } from "rollup-plugin-dts";
import tsConfigPaths from "rollup-plugin-tsconfig-paths";
// import commonjs from "@rollup/plugin-commonjs";
// import terser from "@rollup/plugin-terser";

/** @type {import('ts').JestConfigWithTsJest} */
export default [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    external: ["@keplr-ewallet/stdlib-js", "@keplr-wallet/types"],
    plugins: [
      nodeResolve(),
      // commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts", // Output path for the bundled declaration file
      format: "esm",
    },
    plugins: [tsConfigPaths(), nodeResolve(), dts(), typescript()],
  },
  // {
  //   file: "dist/index.min.js",
  //   format: "esm",
  //   sourcemap: true,
  //   plugins: [terser()],
  // },
];
