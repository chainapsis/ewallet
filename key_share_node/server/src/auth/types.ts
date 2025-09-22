export type OAuthValidationFail =
  | {
    type: "client_id_not_same";
    expected: string;
    actual: string;
  }
  | {
    type: "invalid_token";
  }
  | {
    type: "email_not_verified";
  }
  | {
    type: "invalid_issuer";
  }
  | {
    type: "token_expired";
  }
  | {
    type: "unknown";
    error: any;
  };
