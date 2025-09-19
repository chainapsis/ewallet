import type { Pool } from "pg";

export interface ServerState {
  db: Pool;
  encryptionSecret: string;
}
