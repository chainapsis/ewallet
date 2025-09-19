import type { ServerState } from "./state";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      DB_SSL: string;
      ENCRYPTION_SECRET_PATH: string;
      ADMIN_PASSWORD: string;
      DUMP_DIR: string;
    }
  }

  namespace Express {
    interface Locals extends ServerState { }
  }
}

export { };
