export type EthEwalletInitError =
  | {
      type: "ewallet_core_init_fail";
      msg: string;
    }
  | {
      type: "unknown_error";
      msg: string;
    };

export type LazyInitError = {
  type: "eWallet failed to initialize";
};

export type SendGetEthChainInfoError =
  | { type: "wrong_ack_message_type" }
  | { type: "payload_contains_err"; err: any };
