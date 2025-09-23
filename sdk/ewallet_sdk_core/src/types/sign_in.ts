export type OAuthSignInError =
  | {
    type: "origin_not_registered";
  }
  | {
    type: "key_share_combine_fail";
    error: string;
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
  | { type: "invalid_msg_type"; msg_type: string }
  | { type: "vendor_token_verification_failed" }
  | { type: "api_key_missing" }
  | {
    type: "unknown";
    error: string;
  };
