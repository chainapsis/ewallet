export type CVApiResponse<T> = CVApiSuccessResponse<T> | CVApiErrorResponse;

export interface CVApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface CVApiErrorResponse {
  success: false;
  code: CVApiErrorCode;
  msg: string;
}

export type CVApiErrorCode = string;
