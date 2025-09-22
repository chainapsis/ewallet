import type { Pool } from "pg";

export interface ServerState {
  db: Pool;
  encryptionSecret: string;

  latest_backup_time: Date | null;
  is_db_backup_checked: boolean;
  launch_time: Date;
  git_hash: string | null;
  version: string;
}
