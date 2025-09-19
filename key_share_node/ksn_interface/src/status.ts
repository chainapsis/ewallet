export interface ServerStatus {
  is_db_connected: boolean;
  is_db_backup_checked: boolean;
  latest_backup_time: Date | null;
  ks_node_public_key: string;
  launch_time: Date;
  git_hash: string;
}
