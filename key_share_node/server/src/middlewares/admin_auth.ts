import type { Request, Response, NextFunction } from "express";

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
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      msg: "Invalid admin password",
    });
  }

  next();
  return;
}
