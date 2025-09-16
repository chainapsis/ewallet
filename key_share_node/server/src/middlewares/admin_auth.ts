import type { KSNodeApiErrorResponse } from "@keplr-ewallet/ksn-interface/response";
import type { Request, Response, NextFunction } from "express";

import { ErrorCodeMap } from "@keplr-ewallet-ksn-server/error";

export interface AdminAuthenticatedRequest<T = any> extends Request {
  body: T;
}

export async function adminAuthMiddleware(
  req: AdminAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const { password } = req.body;
  const state = req.app.locals as any;

  if (password !== state.env.ADMIN_PASSWORD) {
    const errorRes: KSNodeApiErrorResponse = {
      success: false,
      code: "UNAUTHORIZED",
      msg: "Invalid admin password",
    };
    return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
  }

  next();
  return;
}
