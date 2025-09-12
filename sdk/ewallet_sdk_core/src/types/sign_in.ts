export type OAuthSignInError =
  | {
    type: "origin_not_registered";
  }
  | {
    type: "check_user_request_fail";
    error: string;
  }
  | {
    type: "sign_in_request_fail";
    error: string;
  }
  | {
    type: "nonce_missing";
  }
  | { type: "not_sign_in_msg" }
  | { type: "vendor_token_verification_failed" }
  | { type: "api_key_missing" }
  | {
    type: "unknown";
    error: string;
  };
