export interface KeplrEwalletInitArgs {
  api_key: string;
  sdk_endpoint?: string;
}

export interface InitMsgHandlerArgs {}

export interface InitResult {
  email: string | null;
  public_key: string | null;
}
