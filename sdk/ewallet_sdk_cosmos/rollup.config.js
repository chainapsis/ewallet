import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import tsConfigPaths from "rollup-plugin-tsconfig-paths";
import dts from "rollup-plugin-dts";
import commonjs from "@rollup/plugin-commonjs";
// import commonjs from "@rollup/plugin-commonjs";
// import terser from "@rollup/plugin-terser";

export default [
  {
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
    external: [
      "@keplr-ewallet/ewallet-sdk-core",
      "@cosmjs/amino",
      "@cosmjs/proto-signing",
      "@keplr-ewallet/stdlib-js",
      "@keplr-wallet/proto-types",
      "@keplr-wallet/types",
      "@noble/curves",
      "@noble/hashes",
      "bech32",
      "buffer",
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        noEmitOnError: true,
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
    plugins: [tsConfigPaths(), nodeResolve(), dts()],
  },
];
