import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import type {
  KSNodeWallet,
  CreateKSNodeWalletRequest,
} from "@keplr-ewallet/ksn-interface/wallet";
import type { Result } from "@keplr-ewallet/stdlib-js";
import type { Bytes33 } from "@keplr-ewallet/bytes";

export async function createWallet(
  db: Pool,
  createKSNodeWalletRequest: CreateKSNodeWalletRequest,
): Promise<Result<KSNodeWallet, string>> {
  try {
    const query = `
INSERT INTO wallets (
  wallet_id, user_id, curve_type, 
  public_key
)
VALUES (
  $1, $2, $3, 
  $4
)
RETURNING *
`;

    const values = [
      uuidv4(),
      createKSNodeWalletRequest.user_id,
      createKSNodeWalletRequest.curve_type,
      createKSNodeWalletRequest.public_key,
    ];

    const result = await db.query(query, values);

    const row = result.rows[0];
    if (!row) {
      return {
        success: false,
        err: "Failed to create wallet",
      };
    }

    return {
      success: true,
      data: row as KSNodeWallet,
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function getWalletById(
  db: Pool,
  walletId: string,
): Promise<Result<KSNodeWallet | null, string>> {
  try {
    const query = `
SELECT * FROM wallets 
WHERE wallet_id = $1 
LIMIT 1
`;

    const result = await db.query(query, [walletId]);

    let wallet: KSNodeWallet | null = null;
    if (result.rows.length > 0) {
      wallet = result.rows[0] as KSNodeWallet;
    }

    return {
      success: true,
      data: wallet,
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function getWalletByPublicKey(
  db: Pool,
  publicKey: Bytes33,
): Promise<Result<KSNodeWallet | null, string>> {
  try {
    const query = `
SELECT * FROM wallets 
WHERE public_key = $1 
LIMIT 1
`;

    const result = await db.query(query, [publicKey.toUint8Array()]);

    let wallet: KSNodeWallet | null = null;
    if (result.rows.length > 0) {
      wallet = result.rows[0] as KSNodeWallet;
    }

    return {
      success: true,
      data: wallet,
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}
