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
  // Gating and service-state errors based on SSS plan
  | {
      // Global active nodes below SSS threshold → service suspended
      type: "active_nodes_below_threshold";
    }
  | {
      // Signup path is not allowed because all KS nodes are not ACTIVE
      type: "signup_not_ready";
    }
  | {
      // Reshare is needed but not allowed because all KS nodes are not ACTIVE
      type: "reshare_not_ready";
    }
  | { type: "invalid_msg_type"; msg_type: string }
  | { type: "vendor_token_verification_failed" }
  | { type: "api_key_missing" }
  | {
      type: "unknown";
      error: string;
    };
