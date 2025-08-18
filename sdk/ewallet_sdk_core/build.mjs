import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outfile: "dist/index.js",
    minify: false,
    sourcemap: true,
    format: "esm",
    loader: {
      ".ts": "ts", // Handle TypeScript files (optional, as esbuild does this by default)
    },
    define: {
      // "process.env.NODE_ENV": '"production"', // Define environment variables
    },
    plugins: [],
  })
  .catch(() => process.exit(1));
