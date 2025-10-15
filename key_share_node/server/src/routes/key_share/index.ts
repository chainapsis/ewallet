import { Router, type Response } from "express";
import type {
  CheckKeyShareRequestBody,
  CheckKeyShareResponse,
  GetKeyShareRequestBody,
  GetKeyShareResponse,
  RegisterKeyShareBody,
  ReshareKeyShareBody,
} from "@keplr-ewallet/ksn-interface/key_share";
import { Bytes, type Bytes64 } from "@keplr-ewallet/bytes";
import type { KSNodeApiResponse } from "@keplr-ewallet/ksn-interface/response";

import {
  checkKeyShare,
  getKeyShare,
  registerKeyShare,
  reshareKeyShare,
} from "@keplr-ewallet-ksn-server/api/key_share";
import {
  bearerTokenMiddleware,
  type AuthenticatedRequest,
} from "@keplr-ewallet-ksn-server/middlewares";
import { ErrorCodeMap } from "@keplr-ewallet-ksn-server/error";
import type { ResponseLocal } from "@keplr-ewallet-ksn-server/routes/io";
import type { KSNodeRequest } from "@keplr-ewallet-ksn-server/routes/io";

export function makeKeyshareRouter() {
  const router = Router();

  /**
   * @swagger
   * /keyshare/v1/register:
   *   post:
   *     tags:
   *       - Key Share
   *     summary: Register a new key share
   *     description: Register a new key share for the authenticated user.
   *     security:
   *       - googleAuth: []
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         required: true
   *         description: Google OAuth token (Bearer token format)
   *         schema:
   *           type: string
   *           pattern: '^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$'
   *           example: 'Bearer eyJhbGciOiJIUzI1NiIs...'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterKeyShareBody'
   *     responses:
   *       200:
   *         description: Successfully registered key share
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: "null"
   *       401:
   *         description: Unauthorized - Invalid or missing bearer token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNAUTHORIZED
   *               msg: Unauthorized
   *       409:
   *         description: Conflict - Public key already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: DUPLICATE_PUBLIC_KEY
   *               msg: "Duplicate public key"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNKNOWN_ERROR
   *               msg: "{error message}"
   */
  router.post(
    "/register",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<RegisterKeyShareBody>,
      res: Response<KSNodeApiResponse<void>, ResponseLocal>,
    ) => {
      const googleUser = res.locals.google_user;
      const state = req.app.locals;
      const body = req.body;

      const publicKeyBytesRes = Bytes.fromHexString(body.public_key, 33);
      if (publicKeyBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: "Public key is not valid",
        });
      }

      const shareBytesRes = Bytes.fromHexString(body.share, 64);
      if (shareBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "SHARE_INVALID",
          msg: "Share is not valid",
        });
      }

      const shareBytes: Bytes64 = shareBytesRes.data;

      // Start transaction
      const client = await state.db.connect();
      try {
        await client.query("BEGIN");

        const registerKeyShareRes = await registerKeyShare(
          client,
          {
            email: googleUser.email,
            curve_type: body.curve_type,
            public_key: publicKeyBytesRes.data,
            share: shareBytes,
          },
          state.encryptionSecret,
        );

        if (registerKeyShareRes.success === false) {
          await client.query("ROLLBACK");
          return res.status(ErrorCodeMap[registerKeyShareRes.code]).json({
            success: false,
            code: registerKeyShareRes.code,
            msg: registerKeyShareRes.msg,
          });
        }

        await client.query("COMMIT");
        return res.status(200).json({
          success: true,
          data: void 0,
        });
      } catch (error) {
        await client.query("ROLLBACK");
        return res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: String(error),
        });
      } finally {
        client.release();
      }
    },
  );

  /**
   * @swagger
   * /keyshare/v1/:
   *   post:
   *     tags:
   *       - Key Share
   *     summary: Get a key share
   *     description: Retrieve a key share for the authenticated user
   *     security:
   *       - googleAuth: []
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         required: true
   *         description: Google OAuth token (Bearer token format)
   *         schema:
   *           type: string
   *           pattern: '^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$'
   *           example: 'Bearer eyJhbGciOiJIUzI1NiIs...'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/GetKeyShareRequestBody'
   *     responses:
   *       200:
   *         description: Successfully retrieved key share
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/GetKeyShareResponse'
   *       401:
   *         description: Unauthorized - Invalid or missing bearer token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNAUTHORIZED
   *               msg: Unauthorized
   *       404:
   *         description: Not found - User, wallet or key share not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               userNotFound:
   *                 value:
   *                   success: false
   *                   code: USER_NOT_FOUND
   *                   msg: "User not found"
   *               walletNotFound:
   *                 value:
   *                   success: false
   *                   code: WALLET_NOT_FOUND
   *                   msg: "Wallet not found"
   *               keyShareNotFound:
   *                 value:
   *                   success: false
   *                   code: KEY_SHARE_NOT_FOUND
   *                   msg: "Key share not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNKNOWN_ERROR
   *               msg: "{error message}"
   */
  router.post(
    "/",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<GetKeyShareRequestBody>,
      res: Response<KSNodeApiResponse<GetKeyShareResponse>>,
    ) => {
      const googleUser = res.locals.google_user;
      const state = req.app.locals;

      const publicKeyBytesRes = Bytes.fromHexString(req.body.public_key, 33);
      if (publicKeyBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: "Public key is not valid",
        });
      }

      const getKeyShareRes = await getKeyShare(
        state.db,
        {
          email: googleUser.email,
          public_key: publicKeyBytesRes.data,
        },
        state.encryptionSecret,
      );
      if (getKeyShareRes.success === false) {
        return res.status(ErrorCodeMap[getKeyShareRes.code]).json({
          success: false,
          code: getKeyShareRes.code,
          msg: getKeyShareRes.msg,
        });
      }

      return res.status(200).json({
        success: true,
        data: getKeyShareRes.data,
      });
    },
  );

  /**
   * @swagger
   * /keyshare/v1/check:
   *   post:
   *     tags:
   *       - Key Share
   *     summary: Check if a key share exists
   *     description: Check if a key share exists
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CheckKeyShareRequestBody'
   *     responses:
   *       200:
   *         description: Successfully checked key share
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/CheckKeyShareResponse'
   *       400:
   *         description: Bad request - Public key is not valid
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: PUBLIC_KEY_INVALID
   *               msg: "Public key is not valid"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNKNOWN_ERROR
   *               msg: "{error message}"
   */
  router.post(
    "/check",
    async (
      req: KSNodeRequest<CheckKeyShareRequestBody>,
      res: Response<KSNodeApiResponse<CheckKeyShareResponse>>,
    ) => {
      const body = req.body;

      const publicKeyBytesRes = Bytes.fromHexString(body.public_key, 33);
      if (publicKeyBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: "Public key is not valid",
        });
      }

      const checkKeyShareRes = await checkKeyShare(req.app.locals.db, {
        email: body.email.toLowerCase(),
        public_key: publicKeyBytesRes.data,
      });
      if (checkKeyShareRes.success === false) {
        return res.status(ErrorCodeMap[checkKeyShareRes.code]).json({
          success: false,
          code: checkKeyShareRes.code,
          msg: checkKeyShareRes.msg,
        });
      }

      return res.status(200).json({
        success: true,
        data: checkKeyShareRes.data,
      });
    },
  );

  /**
   * @swagger
   * /keyshare/v1/reshare:
   *   post:
   *     tags:
   *       - Key Share
   *     summary: Create or update (reshare) a key share
   *     description: Creates a new key share if it doesn't exist, or updates an existing key share with a new encrypted share. For existing shares, the previous share is stored in history.
   *     security:
   *       - googleAuth: []
   *     parameters:
   *       - in: header
   *         name: Authorization
   *         required: true
   *         description: Google OAuth token (Bearer token format)
   *         schema:
   *           type: string
   *           pattern: '^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$'
   *           example: 'Bearer eyJhbGciOiJIUzI1NiIs...'
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ReshareKeyShareBody'
   *     responses:
   *       200:
   *         description: Successfully updated key share
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: "null"
   *       401:
   *         description: Unauthorized - Invalid or missing bearer token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNAUTHORIZED
   *               msg: Unauthorized
   *       404:
   *         description: Not found - User, wallet or key share not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               userNotFound:
   *                 value:
   *                   success: false
   *                   code: USER_NOT_FOUND
   *                   msg: "User not found"
   *               walletNotFound:
   *                 value:
   *                   success: false
   *                   code: WALLET_NOT_FOUND
   *                   msg: "Wallet not found"
   *               keyShareNotFound:
   *                 value:
   *                   success: false
   *                   code: KEY_SHARE_NOT_FOUND
   *                   msg: "Key share not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNKNOWN_ERROR
   *               msg: "{error message}"
   */
  router.post(
    "/reshare",
    bearerTokenMiddleware,
    async (
      req: AuthenticatedRequest<ReshareKeyShareBody>,
      res: Response<KSNodeApiResponse<void>, ResponseLocal>,
    ) => {
      const googleUser = res.locals.google_user;
      const state = req.app.locals;
      const body = req.body;

      const publicKeyBytesRes = Bytes.fromHexString(body.public_key, 33);
      if (publicKeyBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "PUBLIC_KEY_INVALID",
          msg: "Public key is not valid",
        });
      }

      const shareBytesRes = Bytes.fromHexString(body.share, 64);
      if (shareBytesRes.success === false) {
        return res.status(400).json({
          success: false,
          code: "SHARE_INVALID",
          msg: "Share is not valid",
        });
      }

      const shareBytes: Bytes64 = shareBytesRes.data;

      // Start transaction
      const client = await state.db.connect();
      try {
        await client.query("BEGIN");

        const reshareKeyShareRes = await reshareKeyShare(
          client,
          {
            email: googleUser.email,
            curve_type: body.curve_type,
            public_key: publicKeyBytesRes.data,
            share: shareBytes,
          },
          state.encryptionSecret,
        );

        if (reshareKeyShareRes.success === false) {
          await client.query("ROLLBACK");
          return res.status(ErrorCodeMap[reshareKeyShareRes.code]).json({
            success: false,
            code: reshareKeyShareRes.code,
            msg: reshareKeyShareRes.msg,
          });
        }

        await client.query("COMMIT");
        return res.status(200).json({
          success: true,
          data: void 0,
        });
      } catch (error) {
        await client.query("ROLLBACK");
        return res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: String(error),
        });
      } finally {
        client.release();
      }
    },
  );

  return router;
}
