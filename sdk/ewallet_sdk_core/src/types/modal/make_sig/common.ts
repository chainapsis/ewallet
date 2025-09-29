export type MakeSigError =
  | {
    type: "api_key_not_found";
  }
  | {
    type: "key_share_not_combined";
  }
  | {
    type: "wallet_not_found";
  }
  | {
    type: "jwt_not_found";
  };
// | MakeSignOutputError;

export type RunTriplesError =
  | { type: "aborted" }
  | { type: "error"; msg: string };
export type RunSignError = { type: "aborted" } | { type: "error"; msg: string };

export type RunPresignError =
  | { type: "aborted" }
  | { type: "error"; msg: string };

export type MakeSignOutputError =
  | {
    type: "aborted";
  }
  | {
    type: "error";
    error: RunTriplesError | RunSignError | RunPresignError;
  };
