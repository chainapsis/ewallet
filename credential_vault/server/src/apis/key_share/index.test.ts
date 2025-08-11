import { Pool } from "pg";
import {
  createKeyShare,
  createUser,
  createWallet,
  getKeyShareByWalletId,
  getUserByEmail,
  getWalletByPublicKey,
} from "@keplr-ewallet/credential-vault-pg-interface";
import { Bytes, type Bytes33 } from "@keplr-ewallet/bytes";

import {
  createPgDatabase,
  resetPgDatabase,
} from "@keplr-ewallet-cv-server/database";
import { testPgConfig } from "@keplr-ewallet-cv-server/database/test_config";
import {
  checkKeyShare,
  getKeyShare,
  registerKeyShare,
} from "@keplr-ewallet-cv-server/apis/key_share";
import {
  decryptData,
  encryptData,
  TEMP_ENC_SECRET,
} from "@keplr-ewallet-cv-server/apis/utils";

describe("key_share_test", () => {
  let pool: Pool;

  beforeAll(async () => {
    const config = testPgConfig;
    const createPostgresRes = await createPgDatabase({
      database: config.database,
      host: config.host,
      password: config.password,
      user: config.user,
      port: config.port,
      ssl: config.ssl,
    });

    if (createPostgresRes.success === false) {
      console.error(createPostgresRes.err);
      throw new Error("Failed to create postgres database");
    }

    pool = createPostgresRes.data;
  });

  beforeEach(async () => {
    await resetPgDatabase(pool);
  });

  describe("register key share", () => {
    it("register key share success", async () => {
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";
      const encShare = "8c5e2d17ab9034f65d1c3b7a29ef4d88";

      const publicKeyBytesRes = Bytes.fromHexString(publicKey, 33);
      if (publicKeyBytesRes.success === false) {
        console.error(publicKeyBytesRes.err);
        throw new Error("Failed to get public key bytes");
      }

      const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;

      const registerKeyShareRes = await registerKeyShare(pool, {
        email: "test@test.com",
        curve_type: "secp256k1",
        public_key: publicKeyBytes,
        enc_share: encShare,
      });

      expect(registerKeyShareRes.success).toBe(true);
      if (registerKeyShareRes.success === false) {
        console.error(registerKeyShareRes.err);
        throw new Error("Failed to register key share");
      }

      const getUserRes = await getUserByEmail(pool, "test@test.com");
      if (getUserRes.success === false) {
        console.error(getUserRes.err);
        throw new Error("Failed to get user");
      }

      expect(getUserRes.data).toBeDefined();
      expect(getUserRes.data?.user_id).toBeDefined();

      const getWalletRes = await getWalletByPublicKey(pool, publicKeyBytes);
      if (getWalletRes.success === false) {
        console.error(getWalletRes.err);
        throw new Error("Failed to get wallet");
      }

      expect(getWalletRes.data).toBeDefined();
      expect(getWalletRes.data?.wallet_id).toBeDefined();

      const getKeyShareRes = await getKeyShareByWalletId(
        pool,
        getWalletRes.data!.wallet_id,
      );
      if (getKeyShareRes.success === false) {
        console.error(getKeyShareRes.err);
        throw new Error("Failed to get key share");
      }

      const decryptedShare = decryptData(
        getKeyShareRes.data?.enc_share.toString("utf-8")!,
        TEMP_ENC_SECRET,
      );

      expect(getKeyShareRes.data).toBeDefined();
      expect(getKeyShareRes.data?.share_id).toBeDefined();
      expect(decryptedShare).toEqual(encShare);
    });

    it("register key share failure - duplicate public key", async () => {
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";
      const encShare = "8c5e2d17ab9034f65d1c3b7a29ef4d88";

      const publicKeyBytesRes = Bytes.fromHexString(publicKey, 33);
      if (publicKeyBytesRes.success === false) {
        console.error(publicKeyBytesRes.err);
        throw new Error("Failed to get public key bytes");
      }

      const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;

      await createWallet(pool, {
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
      });

      const registerKeyShareRes = await registerKeyShare(pool, {
        email: "test@test.com",
        curve_type: "secp256k1",
        public_key: publicKeyBytes,
        enc_share: encShare,
      });

      if (registerKeyShareRes.success === true) {
        throw new Error("register key share should fail");
      }

      expect(registerKeyShareRes.success).toBe(false);
      expect(registerKeyShareRes.err.code).toBe("DUPLICATE_PUBLIC_KEY");
      expect(registerKeyShareRes.err.message).toBe("Duplicate public key");
    });
  });

  describe("get key share", () => {
    it("get key share success", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";
      const encShare = "8c5e2d17ab9034f65d1c3b7a29ef4d88";

      const publicKeyBytesRes = Bytes.fromHexString(publicKey, 33);
      if (publicKeyBytesRes.success === false) {
        console.error(publicKeyBytesRes.err);
        throw new Error("Failed to get public key bytes");
      }

      const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;

      await registerKeyShare(pool, {
        email,
        curve_type: "secp256k1",
        public_key: publicKeyBytes,
        enc_share: encShare,
      });

      const getKeyShareRes = await getKeyShare(pool, {
        email,
        public_key: publicKeyBytes,
      });

      if (getKeyShareRes.success === false) {
        console.error(getKeyShareRes.err);
        throw new Error("Failed to get key share");
      }

      expect(getKeyShareRes.data).toBeDefined();
      expect(getKeyShareRes.data?.share_id).toBeDefined();
      expect(getKeyShareRes.data?.enc_share).toEqual(encShare);
    });

    it("get key share failure - user not found", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";
      const encShare = "8c5e2d17ab9034f65d1c3b7a29ef4d88";

      const publicKeyBytesRes = Bytes.fromHexString(publicKey, 33);
      if (publicKeyBytesRes.success === false) {
        console.error(publicKeyBytesRes.err);
        throw new Error("Failed to get public key bytes");
      }

      const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;

      await registerKeyShare(pool, {
        email: "test2@test.com",
        curve_type: "secp256k1",
        public_key: publicKeyBytes,
        enc_share: encShare,
      });

      const getKeyShareRes = await getKeyShare(pool, {
        email,
        public_key: publicKeyBytes,
      });

      expect(getKeyShareRes.success).toBe(false);
      if (getKeyShareRes.success === true) {
        throw new Error("get key share should fail");
      }
      expect(getKeyShareRes.err.code).toBe("USER_NOT_FOUND");
      expect(getKeyShareRes.err.message).toBe("User not found");
    });

    it("get key share failure - wallet not found", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";
      const encShare = "8c5e2d17ab9034f65d1c3b7a29ef4d88";
      const publicKey2 =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC5600";

      const publicKeyBytesRes = Bytes.fromHexString(publicKey, 33);
      if (publicKeyBytesRes.success === false) {
        console.error(publicKeyBytesRes.err);
        throw new Error("Failed to get public key bytes");
      }
      const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;

      const publicKeyBytes2Res = Bytes.fromHexString(publicKey2, 33);
      if (publicKeyBytes2Res.success === false) {
        console.error(publicKeyBytes2Res.err);
        throw new Error("Failed to get public key bytes");
      }
      const publicKeyBytes2: Bytes33 = publicKeyBytes2Res.data;

      const createUserRes = await createUser(pool, email);
      if (createUserRes.success === false) {
        console.error(createUserRes.err);
        throw new Error("Failed to create user");
      }

      await registerKeyShare(pool, {
        email,
        curve_type: "secp256k1",
        public_key: publicKeyBytes2,
        enc_share: encShare,
      });

      const getKeyShareRes = await getKeyShare(pool, {
        email,
        public_key: publicKeyBytes,
      });

      expect(getKeyShareRes.success).toBe(false);
      if (getKeyShareRes.success === true) {
        throw new Error("get key share should fail");
      }
      expect(getKeyShareRes.err.code).toBe("WALLET_NOT_FOUND");
      expect(getKeyShareRes.err.message).toBe("Wallet not found");
    });

    it("get key share failure - unauthorized", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";

      const publicKeyBytesRes = Bytes.fromHexString(publicKey, 33);
      if (publicKeyBytesRes.success === false) {
        console.error(publicKeyBytesRes.err);
        throw new Error("Failed to get public key bytes");
      }
      const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;

      await createUser(pool, email);

      await createWallet(pool, {
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
      });

      const getKeyShareRes = await getKeyShare(pool, {
        email,
        public_key: publicKeyBytes,
      });

      expect(getKeyShareRes.success).toBe(false);
      if (getKeyShareRes.success === true) {
        throw new Error("get key share should fail");
      }
      expect(getKeyShareRes.err.code).toBe("UNAUTHORIZED");
      expect(getKeyShareRes.err.message).toBe("Unauthorized");
    });

    it("get key share failure - key share not found", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";

      const publicKeyBytesRes = Bytes.fromHexString(publicKey, 33);
      if (publicKeyBytesRes.success === false) {
        console.error(publicKeyBytesRes.err);
        throw new Error("Failed to get public key bytes");
      }
      const publicKeyBytes: Bytes33 = publicKeyBytesRes.data;

      const createUserRes = await createUser(pool, email);
      if (createUserRes.success === false) {
        console.error(createUserRes.err);
        throw new Error("Failed to create user");
      }

      const createWalletRes = await createWallet(pool, {
        user_id: createUserRes.data!.user_id,
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
      });
      if (createWalletRes.success === false) {
        console.error(createWalletRes.err);
        throw new Error("Failed to create wallet");
      }

      const getKeyShareRes = await getKeyShare(pool, {
        email,
        public_key: publicKeyBytes,
      });

      expect(getKeyShareRes.success).toBe(false);
      if (getKeyShareRes.success === true) {
        throw new Error("get key share should fail");
      }
      expect(getKeyShareRes.err.code).toBe("KEY_SHARE_NOT_FOUND");
      expect(getKeyShareRes.err.message).toBe("Key share not found");
    });
  });

  describe("check key share", () => {
    it("should return true if key share exists", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";
      const encShare = "8c5e2d17ab9034f65d1c3b7a29ef4d88";

      const createUserRes = await createUser(pool, email);
      if (createUserRes.success === false) {
        console.error(createUserRes.err);
        throw new Error("Failed to create user");
      }

      const createWalletRes = await createWallet(pool, {
        user_id: createUserRes.data!.user_id,
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
      });
      if (createWalletRes.success === false) {
        console.error(createWalletRes.err);
        throw new Error("Failed to create wallet");
      }

      const createKeyShareRes = await createKeyShare(pool, {
        wallet_id: createWalletRes.data!.wallet_id,
        enc_share: Buffer.from(encShare, "hex"),
      });
      if (createKeyShareRes.success === false) {
        console.error(createKeyShareRes.err);
        throw new Error("Failed to create key share");
      }

      const checkKeyShareRes = await checkKeyShare(pool, {
        email,
        public_key: publicKey,
      });
      if (checkKeyShareRes.success === false) {
        console.error(checkKeyShareRes.err);
        throw new Error("Failed to check key share");
      }

      expect(checkKeyShareRes.success).toBe(true);
      expect(checkKeyShareRes.data?.is_exists).toBe(true);
    });

    it("should return false if user not found", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";

      const checkKeyShareRes = await checkKeyShare(pool, {
        email,
        public_key: publicKey,
      });
      if (checkKeyShareRes.success === false) {
        console.error(checkKeyShareRes.err);
        throw new Error("Failed to check key share");
      }

      expect(checkKeyShareRes.success).toBe(true);
      expect(checkKeyShareRes.data?.is_exists).toBe(false);
    });

    it("should return false if wallet not found", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";

      const createUserRes = await createUser(pool, email);
      if (createUserRes.success === false) {
        console.error(createUserRes.err);
        throw new Error("Failed to create user");
      }

      const checkKeyShareRes = await checkKeyShare(pool, {
        email,
        public_key: publicKey,
      });
      if (checkKeyShareRes.success === false) {
        console.error(checkKeyShareRes.err);
        throw new Error("Failed to check key share");
      }

      expect(checkKeyShareRes.success).toBe(true);
      expect(checkKeyShareRes.data?.is_exists).toBe(false);
    });

    it("should fail if public key is not valid", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";

      const createUserRes = await createUser(pool, email);
      if (createUserRes.success === false) {
        console.error(createUserRes.err);
        throw new Error("Failed to create user");
      }

      const createWalletRes = await createWallet(pool, {
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
      });
      if (createWalletRes.success === false) {
        console.error(createWalletRes.err);
        throw new Error("Failed to create wallet");
      }

      const checkKeyShareRes = await checkKeyShare(pool, {
        email,
        public_key: publicKey,
      });
      if (checkKeyShareRes.success === true) {
        throw new Error("check key share should fail");
      }

      expect(checkKeyShareRes.success).toBe(false);
      expect(checkKeyShareRes.err.code).toBe("PUBLIC_KEY_INVALID");
      expect(checkKeyShareRes.err.message).toBe("Public key is not valid");
    });

    it("should return false if key share not found", async () => {
      const email = "test@test.com";
      const publicKey =
        "028812785B3F855F677594A6FEB76CA3FD39F2CA36AC5A8454A1417C4232AC566D";

      const createUserRes = await createUser(pool, email);
      if (createUserRes.success === false) {
        console.error(createUserRes.err);
        throw new Error("Failed to create user");
      }

      const createWalletRes = await createWallet(pool, {
        user_id: createUserRes.data!.user_id,
        curve_type: "secp256k1",
        public_key: Buffer.from(publicKey, "hex"),
      });
      if (createWalletRes.success === false) {
        console.error(createWalletRes.err);
        throw new Error("Failed to create wallet");
      }

      const checkKeyShareRes = await checkKeyShare(pool, {
        email,
        public_key: publicKey,
      });
      if (checkKeyShareRes.success === false) {
        console.error(checkKeyShareRes.err);
        throw new Error("Failed to check key share");
      }

      expect(checkKeyShareRes.success).toBe(true);
      expect(checkKeyShareRes.data?.is_exists).toBe(false);
    });
  });
});
