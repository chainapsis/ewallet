export interface DBRestoreRequest {
  dump_path: string;
}

export interface DBRestoreResponse {
  dump_path: string;
}

export interface GetBackupHistoryRequest {
  days?: number;
}
