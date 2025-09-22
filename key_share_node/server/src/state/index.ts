import type { Pool } from "pg";

export interface ServerState {
  db: Pool;
  encryptionSecret: string;

  latest_backup_time: string | null;
  is_db_backup_checked: boolean;
  launch_time: string;
  git_hash: string | null;
  version: string;
}
