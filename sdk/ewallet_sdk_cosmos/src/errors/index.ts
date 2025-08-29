export type CosmosEwalletInitError =
  | {
    type: "ewallet_core_init_fail";
    msg: string;
  }
  | {
    type: "unknown_error";
    msg: string;
  };
