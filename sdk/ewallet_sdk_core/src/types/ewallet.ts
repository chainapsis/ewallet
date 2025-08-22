import type { Result } from "@keplr-ewallet/stdlib-js";

export interface KeplrEwalletInitArgs {
  api_key: string;
  sdk_endpoint?: string;
}

export interface InitMsgHandlerArgs {}

export interface InitResult {
  public_key: string | null;
}

export interface LazyInitSubscriberFn {
  (result: Result<InitResult, string>): void;
}
