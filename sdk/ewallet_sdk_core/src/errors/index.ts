export type KeplrEwalletInitError =
  | {
    type: "is_locked";
  }
  | {
    type: "not_in_browser";
  }
  | {
    type: "host_origin_empty";
  }
  | {
    type: "sdk_endpoint_invalid_url";
  }
  | {
    type: "iframe_setup_fail"; //
    msg: string;
  }
  | {
    type: "unknown_error";
    msg: string;
  };
