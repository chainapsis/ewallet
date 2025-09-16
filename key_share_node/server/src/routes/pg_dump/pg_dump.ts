import { Router, type Response } from "express";
import fs from "node:fs/promises";
import type {
  KSNodeApiErrorResponse,
  KSNodeApiResponse,
} from "@keplr-ewallet/ksn-interface/response";
import {
  getAllPgDumps,
  restore,
  type PgDump,
} from "@keplr-ewallet/ksn-pg-interface";

import {
  processPgDump,
  type PgDumpResult,
} from "@keplr-ewallet-ksn-server/pg_dump/dump";
import {
  adminAuthMiddleware,
  type AdminAuthenticatedRequest,
} from "@keplr-ewallet-ksn-server/middlewares";
import { ErrorCodeMap } from "@keplr-ewallet-ksn-server/error";

export function setPgDumpRoutes(router: Router) {
  /**
   * @swagger
   * /pg_dump/v1/:
   *   post:
   *     tags:
   *       - PG Dump
   *     summary: Request a pg dump
   *     description: Request a pg dump
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PgDumpRequestBody'
   *     responses:
   *       200:
   *         description: Successfully requested pg dump
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/PgDumpResponse'
   *       401:
   *         description: Invalid admin password
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNAUTHORIZED
   *               msg: "Invalid admin password"
   *       500:
   *         description: Failed to process pg dump
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: PG_DUMP_FAILED
   *               msg: "Failed to process pg dump"
   */
  router.post(
    "/",
    adminAuthMiddleware,
    async (
      req: AdminAuthenticatedRequest,
      res: Response<KSNodeApiResponse<PgDumpResult>>,
    ) => {
      const state = req.app.locals as any;

      const processPgDumpRes = await processPgDump(
        state.db,
        {
          database: state.env.DB_NAME,
          host: state.env.DB_HOST,
          password: state.env.DB_PASSWORD,
          user: state.env.DB_USER,
          port: state.env.DB_PORT,
        },
        state.env.DUMP_DIR,
      );
      if (processPgDumpRes.success === false) {
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "PG_DUMP_FAILED",
          msg: processPgDumpRes.err,
        };
        return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      }

      return res.status(200).json({
        success: true,
        data: processPgDumpRes.data,
      });
    },
  );

  /**
   * @swagger
   * /pg_dump/v1/:
   *   get:
   *     tags:
   *       - PG Dump
   *     summary: Get pg dump history
   *     description: Get pg dump history for the specified number of days
   *     parameters:
   *       - in: query
   *         name: days
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 1000
   *         description: Number of days to look back for dump history (1-1000 days). If not specified, returns all dumps.
   *         example: 30
   *     responses:
   *       200:
   *         description: Successfully retrieved pg dump history
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/PgDump'
   *       400:
   *         description: Invalid days parameter
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: INVALID_DAYS
   *               msg: "Days parameter must be between 1 and 1000"
   *       500:
   *         description: Failed to retrieve pg dump history
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNKNOWN_ERROR
   *               msg: "Failed to retrieve pg dump history"
   */
  router.get("/", async (req, res: Response<KSNodeApiResponse<PgDump[]>>) => {
    const { days } = req.query;
    const state = req.app.locals as any;

    let daysNum: number | undefined;
    if (days !== undefined) {
      daysNum = parseInt(days as string, 10);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 1000) {
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "INVALID_DAYS",
          msg: "Days parameter must be between 1 and 1000",
        };
        return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      }
    }

    const dumpsResult = await getAllPgDumps(state.db, daysNum);
    if (dumpsResult.success === false) {
      const errorRes: KSNodeApiErrorResponse = {
        success: false,
        code: "UNKNOWN_ERROR",
        msg: dumpsResult.err,
      };
      return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
    }

    return res.status(200).json({
      success: true,
      data: dumpsResult.data,
    });
  });

  /**
   * @swagger
   * /pg_dump/v1/restore:
   *   post:
   *     tags:
   *       - PG Dump
   *     summary: Restore a pg dump
   *     description: Restore a pg dump
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PgRestoreRequestBody'
   *     responses:
   *       200:
   *         description: Successfully restored pg dump
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         dump_path:
   *                           type: string
   *                           description: The path to the pg dump that was restored
   *                           example: "/path/to/dump.sql"
   *       400:
   *         description: Invalid dump_path parameter or file not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               INVALID_DUMP_PATH:
   *                 summary: Invalid dump_path parameter
   *                 value:
   *                   success: false
   *                   code: INVALID_DUMP_PATH
   *                   msg: "dump_path parameter is required"
   *               DUMP_FILE_NOT_FOUND:
   *                 summary: Dump file not found
   *                 value:
   *                   success: false
   *                   code: DUMP_FILE_NOT_FOUND
   *                   msg: "Dump file not found at path: /path/to/dump.sql"
   *               INVALID_DUMP_FILE:
   *                 summary: Path is not a file
   *                 value:
   *                   success: false
   *                   code: INVALID_DUMP_FILE
   *                   msg: "Path is not a file: /path/to/dump.sql"
   *               DUMP_FILE_ACCESS_ERROR:
   *                 summary: Cannot access dump file
   *                 value:
   *                   success: false
   *                   code: DUMP_FILE_ACCESS_ERROR
   *                   msg: "Cannot access dump file: /path/to/dump.sql"
   *       401:
   *         description: Invalid admin password
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNAUTHORIZED
   *               msg: "Invalid admin password"
   *       500:
   *         description: Failed to restore pg dump
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: PG_RESTORE_FAILED
   *               msg: "Failed to restore pg dump"
   */
  router.post(
    "/restore",
    adminAuthMiddleware,
    async (
      req: AdminAuthenticatedRequest<{ dump_path: string }>,
      res: Response<KSNodeApiResponse<{ dump_path: string }>>,
    ) => {
      const state = req.app.locals as any;

      const dumpPath = req.body.dump_path;

      if (!dumpPath) {
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "INVALID_DUMP_PATH",
          msg: "dump_path parameter is required",
        };
        return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      }

      try {
        await fs.access(dumpPath);
      } catch (error) {
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "DUMP_FILE_NOT_FOUND",
          msg: `Dump file not found at path: ${dumpPath}`,
        };
        return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      }

      try {
        const stats = await fs.stat(dumpPath);
        if (!stats.isFile()) {
          const errorRes: KSNodeApiErrorResponse = {
            success: false,
            code: "INVALID_DUMP_FILE",
            msg: `Path is not a file: ${dumpPath}`,
          };
          return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
        }
      } catch (error) {
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "DUMP_FILE_ACCESS_ERROR",
          msg: `Cannot access dump file: ${dumpPath}`,
        };
        return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      }

      const restoreRes = await restore(
        {
          database: state.env.DB_NAME,
          host: state.env.DB_HOST,
          password: state.env.DB_PASSWORD,
          user: state.env.DB_USER,
          port: state.env.DB_PORT,
        },
        dumpPath,
      );
      if (restoreRes.success === false) {
        const errorRes: KSNodeApiErrorResponse = {
          success: false,
          code: "PG_RESTORE_FAILED",
          msg: restoreRes.err,
        };
        return res.status(ErrorCodeMap[errorRes.code]).json(errorRes);
      }

      return res.status(200).json({
        success: true,
        data: {
          dump_path: dumpPath,
        },
      });
    },
  );
}
