import type { Pool, PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";
import type {
  CreateKeyShareRequest,
  KeyShare,
  KeyShareStatus,
} from "@keplr-ewallet/ksn-interface/key_share";
import type { Result } from "@keplr-ewallet/stdlib-js";

export async function createKeyShare(
  db: Pool | PoolClient,
  keyShareData: CreateKeyShareRequest,
): Promise<Result<KeyShare, string>> {
  try {
    const query = `
INSERT INTO key_shares (
  share_id, wallet_id, enc_share, status
)
VALUES (
  $1, $2, $3, $4
)
RETURNING *
    `;

    const values = [
      uuidv4(),
      keyShareData.wallet_id,
      keyShareData.enc_share,
      "active" as KeyShareStatus,
    ];

    const result = await db.query<KeyShare>(query, values);

    const row = result.rows.length !== 1 ? undefined : result.rows[0];
    if (row === undefined) {
      return { success: false, err: "Failed to create key share" };
    }

    return { success: true, data: row };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function getKeyShareByShareId(
  db: Pool | PoolClient,
  shareId: string,
): Promise<Result<KeyShare | null, string>> {
  try {
    const query = `
SELECT * FROM key_shares 
WHERE share_id = $1 
LIMIT 1
`;
    const result = await db.query(query, [shareId]);

    const row = result.rows[0];
    if (!row) {
      return { success: true, data: null };
    }

    return { success: true, data: row as KeyShare };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function getKeyShareByWalletId(
  db: Pool | PoolClient,
  walletId: string,
): Promise<Result<KeyShare | null, string>> {
  try {
    const query = `
SELECT * FROM key_shares 
WHERE wallet_id = $1 
LIMIT 1
`;
    const result = await db.query(query, [walletId]);

    const row = result.rows[0];
    if (!row) {
      return { success: true, data: null };
    }

    return { success: true, data: row as KeyShare };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function updateReshare(
  db: Pool | PoolClient,
  walletId: string,
): Promise<Result<KeyShare, string>> {
  try {
    const query = `
UPDATE key_shares AS ks
SET 
  status = $1,
  reshared_at = NOW(),
  updated_at = NOW()
WHERE ks.wallet_id = $2
RETURNING *
`;

    const values = ["active" as KeyShareStatus, walletId];

    const result = await db.query<KeyShare>(query, values);

    const row = result.rows.length !== 1 ? undefined : result.rows[0];
    if (row === undefined) {
      return {
        success: false,
        err: "Failed to update key share",
      };
    }

    return { success: true, data: row };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
