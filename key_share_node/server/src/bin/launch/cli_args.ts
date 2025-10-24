import { program } from "commander";

export function parseCLIArgs() {
  const command = program.version("0.0.1").description("Key share node server");

  command.requiredOption("--node-id <id>");
  command.option("--reset-db", "Reset database schema by running migration");

  command.parse(process.argv);

  const opts = program.opts();
  return opts as CLIArgs;
}

export interface CLIArgs {
  nodeId: string;
  resetDb?: boolean;
}
