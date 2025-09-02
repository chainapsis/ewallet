import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { dts } from "rollup-plugin-dts";
import tsConfigPaths from "rollup-plugin-tsconfig-paths";
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
    external: [
      "@keplr-ewallet/stdlib-js",
      "@keplr-wallet/types",
      "@keplr-ewallet/ewallet-sdk-core",
      "eventemitter3",
      "viem",
      "uuid",
      /^viem\//,
      /^ox\//,
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs({
        include: /node_modules/,
        transformMixedEsModules: true,
      }),
      typescript({
        declaration: false,
        exclude: ["**/*.test.ts", "**/tests/**/*", "**/*.spec.ts"],
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts", // Output path for the bundled declaration file
      format: "esm",
    },
    plugins: [
      tsConfigPaths(),
      nodeResolve(),
      dts(),
      typescript({
        emitDeclarationOnly: true,
        exclude: ["**/*.test.ts", "**/tests/**/*", "**/*.spec.ts"],
      }),
    ],
  },
  // {
  //   file: "dist/index.min.js",
  //   format: "esm",
  //   sourcemap: true,
  //   plugins: [terser()],
  // },
];
