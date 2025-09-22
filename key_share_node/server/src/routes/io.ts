import type { Request } from "express";

export interface KSNodeRequest<T = any> extends Request {
  body: T;
}

export interface ResponseLocal {
  google_user: {
    email: string;
    name: string;
    sub: string;
  };
}
