import { Pool } from "pg";
import {
  createKeyShare,
  createUser,
  createWallet,
  getKeyShareByWalletId,
  getUserByEmail,
  getWalletByPublicKey,
} from "@keplr-ewallet/credential-vault-pg-interface";
import type {
  CheckKeyShareRequest,
  CheckKeyShareResponse,
  GetKeyShareRequest,
  GetKeyShareResponse,
  RegisterKeyShareRequest,
} from "@keplr-ewallet/credential-vault-interface";
import type { Result } from "@keplr-ewallet/stdlib-js";
import { Bytes, type Bytes33 } from "@keplr-ewallet/bytes";

import type { ErrorResponse } from "@keplr-ewallet-cv-server/error";
import {
  decryptData,
  encryptData,
  TEMP_ENC_SECRET,
} from "@keplr-ewallet-cv-server/apis/utils";

export async function registerKeyShare(
  db: Pool,
  registerKeyShareRequest: RegisterKeyShareRequest,
): Promise<Result<void, ErrorResponse>> {
  try {
    const { email, curve_type, public_key, enc_share } =
      registerKeyShareRequest;

    const publicKeyBytesRes = Bytes.fromHexString(public_key, 33);

    if (publicKeyBytesRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: publicKeyBytesRes.err,
        },
      };
    }

    const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;

    const getWalletRes = await getWalletByPublicKey(db, publicKeyBytes);
    if (getWalletRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: getWalletRes.err,
        },
      };
    }

    if (getWalletRes.data !== null) {
      return {
        success: false,
        err: {
          code: "DUPLICATE_PUBLIC_KEY",
          message: "Duplicate public key",
        },
      };
    }

    const getUserRes = await getUserByEmail(db, email);
    if (getUserRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: getUserRes.err,
        },
      };
    }

    let user_id: string;
    if (getUserRes.data === null) {
      const createUserRes = await createUser(db, email);
      if (createUserRes.success === false) {
        return {
          success: false,
          err: {
            code: "UNKNOWN_ERROR",
            message: createUserRes.err,
          },
        };
      }
      user_id = createUserRes.data.user_id;
    } else {
      user_id = getUserRes.data.user_id;
    }

    const createWalletRes = await createWallet(db, {
      user_id,
      curve_type,
      public_key: Buffer.from(public_key, "hex"),
    });
    if (createWalletRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: createWalletRes.err,
        },
      };
    }

    const wallet_id = createWalletRes.data.wallet_id;

    const encryptedShare = encryptData(enc_share, TEMP_ENC_SECRET);
    const encryptedShareBuffer = Buffer.from(encryptedShare, "utf-8");

    const createKeyShareRes = await createKeyShare(db, {
      wallet_id,
      enc_share: encryptedShareBuffer,
    });
    if (createKeyShareRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: createKeyShareRes.err,
        },
      };
    }

    return { success: true, data: void 0 };
  } catch (error) {
    return {
      success: false,
      err: {
        code: "UNKNOWN_ERROR",
        message: String(error),
      },
    };
  }
}

export async function getKeyShare(
  db: Pool,
  getKeyShareRequest: GetKeyShareRequest,
): Promise<Result<GetKeyShareResponse, ErrorResponse>> {
  try {
    const { email, public_key } = getKeyShareRequest;

    const getUserRes = await getUserByEmail(db, email);
    if (getUserRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: getUserRes.err,
        },
      };
    }

    if (getUserRes.data === null) {
      return {
        success: false,
        err: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      };
    }

    const publicKeyBytesRes = Bytes.fromHexString(public_key, 33);
    if (publicKeyBytesRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: publicKeyBytesRes.err,
        },
      };
    }
    const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;
    const getWalletRes = await getWalletByPublicKey(db, publicKeyBytes);
    if (getWalletRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: getWalletRes.err,
        },
      };
    }
    if (getWalletRes.data === null) {
      return {
        success: false,
        err: {
          code: "WALLET_NOT_FOUND",
          message: "Wallet not found",
        },
      };
    }
    if (getWalletRes.data.user_id !== getUserRes.data.user_id) {
      return {
        success: false,
        err: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        },
      };
    }

    const getKeyShareRes = await getKeyShareByWalletId(
      db,
      getWalletRes.data.wallet_id,
    );
    if (getKeyShareRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: getKeyShareRes.err,
        },
      };
    }

    if (getKeyShareRes.data === null) {
      return {
        success: false,
        err: {
          code: "KEY_SHARE_NOT_FOUND",
          message: "Key share not found",
        },
      };
    }

    const decryptedShare = decryptData(
      getKeyShareRes.data.enc_share.toString("utf-8"),
      TEMP_ENC_SECRET,
    );

    return {
      success: true,
      data: {
        share_id: getKeyShareRes.data.share_id,
        enc_share: decryptedShare,
      },
    };
  } catch (error) {
    return {
      success: false,
      err: {
        code: "UNKNOWN_ERROR",
        message: String(error),
      },
    };
  }
}

export async function checkKeyShare(
  db: Pool,
  checkKeyShareRequest: CheckKeyShareRequest,
): Promise<Result<CheckKeyShareResponse, ErrorResponse>> {
  try {
    const { email, public_key } = checkKeyShareRequest;

    const getUserRes = await getUserByEmail(db, email);
    if (getUserRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: getUserRes.err,
        },
      };
    }
    if (getUserRes.data === null) {
      return {
        success: true,
        data: {
          is_exists: false,
        },
      };
    }

    const publicKeyBytesRes = Bytes.fromHexString(public_key, 33);
    if (publicKeyBytesRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: publicKeyBytesRes.err,
        },
      };
    }
    const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;

    const getWalletRes = await getWalletByPublicKey(db, publicKeyBytes);
    if (getWalletRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: getWalletRes.err,
        },
      };
    }
    if (getWalletRes.data === null) {
      return {
        success: true,
        data: {
          is_exists: false,
        },
      };
    }
    if (getWalletRes.data.user_id !== getUserRes.data.user_id) {
      return {
        success: false,
        err: {
          code: "PUBLIC_KEY_INVALID",
          message: "Public key is not valid",
        },
      };
    }

    const getKeyShareRes = await getKeyShareByWalletId(
      db,
      getWalletRes.data.wallet_id,
    );
    if (getKeyShareRes.success === false) {
      return {
        success: false,
        err: {
          code: "UNKNOWN_ERROR",
          message: getKeyShareRes.err,
        },
      };
    }

    if (getKeyShareRes.data === null) {
      return {
        success: true,
        data: {
          is_exists: false,
        },
      };
    }

    return {
      success: true,
      data: {
        is_exists: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      err: {
        code: "UNKNOWN_ERROR",
        message: String(error),
      },
    };
  }
}
