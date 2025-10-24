import type { Result } from "@oko-wallet/stdlib-js";
import type { GoogleTokenInfo } from "@oko-wallet/ksn-interface/auth";

import { GOOGLE_CLIENT_ID } from "./client_id";
import type { OAuthValidationFail } from "./types";

export async function validateOAuthToken(
  idToken: string,
): Promise<Result<GoogleTokenInfo, OAuthValidationFail>> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`,
    );
    if (!res.ok) {
      return { success: false, err: { type: "invalid_token" } };
    }
    const tokenInfo = (await res.json()) as GoogleTokenInfo;

    if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
      return {
        success: false,
        err: {
          type: "client_id_not_same",
          expected: GOOGLE_CLIENT_ID,
          actual: tokenInfo.aud,
        },
      };
    }

    if (
      tokenInfo.iss !== "https://accounts.google.com" &&
      tokenInfo.iss !== "https://oauth2.googleapis.com"
    ) {
      return { success: false, err: { type: "invalid_issuer" } };
    }

    if (tokenInfo.exp && Number(tokenInfo.exp) <= Date.now() / 1000) {
      return { success: false, err: { type: "token_expired" } };
    }

    if (tokenInfo.email_verified !== "true") {
      return { success: false, err: { type: "email_not_verified" } };
    }

    return {
      success: true,
      data: tokenInfo,
    };
  } catch (error: any) {
    return {
      success: false,
      err: {
        type: "unknown",
        error: `Token validation failed: ${error.message}`,
      },
    };
  }
}
