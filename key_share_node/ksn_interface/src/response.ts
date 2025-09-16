export type KSNodeApiResponse<T> =
  | KSNodeApiSuccessResponse<T>
  | KSNodeApiErrorResponse;

export interface KSNodeApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface KSNodeApiErrorResponse {
  success: false;
  code: KSNodeApiErrorCode;
  msg: string;
}

export type KSNodeApiErrorCode =
  | "UNKNOWN_ERROR"
  | "DUPLICATE_PUBLIC_KEY"
  | "USER_NOT_FOUND"
  | "WALLET_NOT_FOUND"
  | "UNAUTHORIZED"
  | "KEY_SHARE_NOT_FOUND"
  | "ID_TOKEN_INVALID"
  | "ID_TOKEN_MISMATCHED"
  | "PUBLIC_KEY_INVALID"
  | "RATE_LIMIT_EXCEEDED";
