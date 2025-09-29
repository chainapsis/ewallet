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
  }
  | MakeSignOutputError;

export type MakeSignOutputError =
  | RunTriplesError
  | RunSignError
  | RunPresignError;

export type RunTriplesError =
  | { type: "aborted" }
  | { type: "triples_fail"; error: any };

export type RunSignError =
  | { type: "aborted" }
  | { type: "sign_fail"; error: any };

export type RunPresignError =
  | { type: "aborted" }
  | { type: "presign_fail"; error: any };
