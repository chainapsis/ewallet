import esbuild from "esbuild";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

esbuild
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outfile: "dist/index.js",
    minify: false,
    sourcemap: true,
    format: "esm",
    banner: {
      js: `
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const global = globalThis;
      `.trim(),
    },
    loader: {
      ".ts": "ts",
    },
    define: {
      // ESM polyfills for CommonJS globals
      __dirname: `"${__dirname}"`,
      __filename: `"${__filename}"`,
      global: "globalThis",
    },
    external: ["crypto"],
    plugins: [],
  })
  .catch(() => process.exit(1));
