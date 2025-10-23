import { z } from "zod";

export const devEnvSchema = z.object({
  MIGRATE_MODE: z.enum(["all", "one", "orange"]),
  USE_ENV_FILE: z.string().optional(),
  NODE_ID: z.string().optional(),
  NODE_COUNT: z.string().optional(),
  DB_NAME: z.string().optional(),
});
