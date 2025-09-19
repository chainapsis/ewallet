import type { Pool } from "pg";

export interface ServerState {
  db: Pool;
  encryptionSecret: string;
  // port: string;
  // db_host: string;
  // db_port: string;
  // db_user: string;
  // db_password: string;
  // db_name: string;
  // db_ssl: string;
  // encryption_secret_path: string;
  // admin_password: string;
  // dump_dir: string;
}
