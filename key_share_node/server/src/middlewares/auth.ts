import type { Request, Response, NextFunction } from "express";
import type { KSNodeApiErrorResponse } from "@keplr-ewallet/ksn-interface/response";

import { validateOAuthToken } from "@keplr-ewallet-ksn-server/auth";
import { ErrorCodeMap } from "@keplr-ewallet-ksn-server/error";
import type { ResponseLocal } from "@keplr-ewallet-ksn-server/response";

export interface AuthenticatedRequest<T = any> extends Request {
  user?: {
    email: string;
    name: string;
    sub: string;
  };
  body: T;
}

export async function bearerTokenMiddleware(
  req: AuthenticatedRequest,
  res: Response<any, ResponseLocal>,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const errorRes: KSNodeApiErrorResponse = {
      success: false,
      code: "UNAUTHORIZED",
      msg: "Authorization header with Bearer token required",
    };
    res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
    return;
  }

  const idToken = authHeader.substring(7); // skip "Bearer "

  try {
    const result = await validateOAuthToken(idToken);

    if (!result.success) {
      const errorRes: KSNodeApiErrorResponse = {
        success: false,
        code: "UNAUTHORIZED",
        msg: result.err || "Invalid token",
      };
      res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      return;
    }

    if (!result.data) {
      const errorRes: KSNodeApiErrorResponse = {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: "Token info missing after validation",
      };
      res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      return;
    }

    if (!result.data.email || !result.data.sub || !result.data.name) {
      const errorRes: KSNodeApiErrorResponse = {
        success: false,
        code: "UNAUTHORIZED",
        msg: "Invalid token",
      };
      res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      return;
    }

    res.locals.google_user = {
      email: result.data.email,
      name: result.data.name,
      sub: result.data.sub,
    };

    next();
    return;
  } catch (error) {
    const errorRes: KSNodeApiErrorResponse = {
      success: false,
      code: "UNKNOWN_ERROR",
      msg: "Token validation failed",
    };
    res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
    return;
  }
}
