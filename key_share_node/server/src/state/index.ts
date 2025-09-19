import type { Pool } from "pg";

export interface ServerState {
  db: Pool;
  encryptionSecret: string;

  is_db_backup_checked: boolean;
  latest_backup_time: Date | null;
  launch_time: Date;
  git_hash: string;
}
