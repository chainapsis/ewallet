export type EthEwalletInitError =
  | {
    type: "ewallet_core_init_fail";
    msg: string;
  }
  | {
    type: "unknown_error";
    msg: string;
  };
