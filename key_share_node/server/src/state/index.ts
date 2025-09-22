import type { Pool } from "pg";

export interface ServerState {
  db: Pool;
  encryptionSecret: string;

  is_db_backup_checked: boolean;
  launch_time: string;
  git_hash: string | null;
  version: string;
}
