// Executing this before any other statement
loadEnv();

import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import path from "node:path";

import { loadEnv, verifyEnv } from "@keplr-ewallet-attached/envs";

async function main() {
  const envRes = verifyEnv();
  if (!envRes.success) {
    console.error("[attached] env variable invalid\n%s", envRes.err);
    process.exit(1);
  }

  const __dirname = fileURLToPath(new URL(".", import.meta.url));

  const root = path.resolve(__dirname, "../../");

  const server = await createServer({
    root,
  });
  await server.listen();

  server.printUrls();
  server.bindCLIShortcuts({
    print: true,
  });
}

main().then();
