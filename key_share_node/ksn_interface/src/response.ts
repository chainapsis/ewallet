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

export type KSNodeApiErrorCode = string;
