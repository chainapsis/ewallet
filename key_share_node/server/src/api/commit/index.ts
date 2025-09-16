import { Pool } from "pg";
import type { CommitIdTokenRequest } from "@keplr-ewallet/ksn-interface/witnessed_id_tokens";
import { commitIdToken } from "@keplr-ewallet/ksn-pg-interface";
import type { Result } from "@keplr-ewallet/stdlib-js";

import type { ErrorResponse } from "@keplr-ewallet-cv-server/error";

export async function commitIdTokenWithUserSessionPublicKey(
  db: Pool,
  commitIdTokenRequest: CommitIdTokenRequest,
): Promise<Result<void, ErrorResponse>> {
  try {
    await commitIdToken(db, commitIdTokenRequest);

    return { success: true, data: void 0 };
  } catch (error) {
    return {
      success: false,
      err: {
        code: "UNKNOWN_ERROR",
        message: String(error),
      },
    };
  }
}
