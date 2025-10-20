import type { Pool, PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";
import type {
  CreateKeyShareRequest,
  KeyShare,
} from "@keplr-ewallet/ksn-interface/key_share";
import type { Result } from "@keplr-ewallet/stdlib-js";

export async function createKeyShare(
  db: Pool | PoolClient,
  keyShareData: CreateKeyShareRequest,
): Promise<Result<KeyShare, string>> {
  try {
    const query = `
INSERT INTO key_shares (
  share_id, wallet_id, enc_share
)
VALUES (
  $1, $2, $3
)
RETURNING *
    `;

    const values = [uuidv4(), keyShareData.wallet_id, keyShareData.enc_share];

    const result = await db.query(query, values);

    const row = result.rows[0];
    if (!row) {
      return { success: false, err: "Failed to create key share" };
    }

    return { success: true, data: row as KeyShare };
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

export async function updateKeyShare(
  db: Pool | PoolClient,
  keyShareData: CreateKeyShareRequest,
): Promise<Result<KeyShare, string>> {
  try {
    const query = `
UPDATE key_shares AS ks
SET aux = jsonb_set(
        COALESCE(ks.aux, '{}'::jsonb),
        '{enc_share_history}',
        COALESCE(ks.aux->'enc_share_history', '[]'::jsonb)
          || jsonb_build_object(
              'enc_share', ks.enc_share,
              'updated_at', ks.updated_at
            ),
        true
    ),
    enc_share = $2,
    updated_at = now()
WHERE ks.wallet_id = $1
RETURNING ks.*
    `;

    const values = [keyShareData.wallet_id, keyShareData.enc_share];

    const result = await db.query(query, values);

    const row = result.rows[0];
    if (!row) {
      return {
        success: false,
        err: "Failed to update key share: not found for wallet",
      };
    }

    return { success: true, data: row as KeyShare };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
