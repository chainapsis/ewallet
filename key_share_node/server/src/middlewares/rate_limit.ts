import type { KSNodeApiErrorResponse } from "@keplr-ewallet/ksn-interface/response";
import rateLimit from "express-rate-limit";

import { ErrorCodeMap } from "@keplr-ewallet-ksn-server/error";

export interface RateLimitMiddlewareOption {
  windowSeconds: number;
  maxRequests: number;
}

export function rateLimitMiddleware(option: RateLimitMiddlewareOption) {
  const message: KSNodeApiErrorResponse = {
    success: false,
    code: "RATE_LIMIT_EXCEEDED",
    msg: `Too many requests, please try again after ${option.windowSeconds} seconds`,
  };

  return rateLimit({
    windowMs: option.windowSeconds * 1000,
    max: option.maxRequests,
    message,
    statusCode: ErrorCodeMap[message.code],
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
  });
}
