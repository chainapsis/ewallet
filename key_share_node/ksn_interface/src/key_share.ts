import type { Bytes33, Bytes64 } from "@keplr-ewallet/bytes";

import type { CurveType } from "./curve_type";

export interface KeyShare {
  share_id: string;
  wallet_id: string;
  enc_share: Buffer;
  created_at: Date;
  updated_at: Date;
  aux?: Record<string, any>;
}

export type CreateKeyShareRequest = {
  wallet_id: string;
  enc_share: Buffer;
};

export interface RegisterKeyShareRequest {
  email: string;
  curve_type: CurveType;
  public_key: Bytes33;
  share: Bytes64;
}

export type RegisterKeyShareBody = {
  curve_type: CurveType;
  public_key: string; // hex string
  share: string;
};

export interface GetKeyShareRequest {
  email: string;
  public_key: Bytes33;
}

export interface GetKeyShareResponse {
  share_id: string;
  share: string;
}

export type GetKeyShareRequestBody = {
  public_key: string; // hex string
};

export interface CheckKeyShareRequest {
  email: string;
  public_key: Bytes33;
}

export interface CheckKeyShareResponse {
  exists: boolean;
}

export interface CheckKeyShareRequestBody {
  email: string;
  public_key: string; // hex string
}

export interface ReshareKeyShareRequest {
  email: string;
  curve_type: CurveType;
  public_key: Bytes33;
  share: Bytes64;
}

export type ReshareKeyShareBody = {
  curve_type: CurveType;
  public_key: string; // hex string
  share: string; // hex string
};
