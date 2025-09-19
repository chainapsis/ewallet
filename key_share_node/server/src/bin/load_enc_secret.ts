import fs from "node:fs";
import type { Result } from "@keplr-ewallet/stdlib-js";

export function loadEncSecret(path: string): Result<string, string> {
  try {
    const encryptionSecret = fs.readFileSync(path, "utf8");

    if (encryptionSecret.length === 0) {
      return {
        success: false,
        err: `Encryption secret is empty`,
      };
    }

    return { success: true, data: encryptionSecret };
  } catch (error) {
    return {
      success: false,
      err: `Failed to load encryption secret: ${String(error)}`,
    };
  }
}
