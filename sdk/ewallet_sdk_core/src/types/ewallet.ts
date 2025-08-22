export interface KeplrEwalletInitArgs {
  api_key: string;
  sdk_endpoint?: string;
}

export interface InitMsgHandlerArgs {}

export interface InitResult {
  public_key: string | null;
}
