import { Bytes, Bytes32 } from "@keplr-ewallet/bytes";
import { Result } from "@keplr-ewallet/stdlib-js";

export type Bytes32Point = {
  x: Bytes32;
  y: Bytes32;
};

export function bytes32PointToHexString(point: Bytes32Point): string {
  return `${point.x.toHex()}${point.y.toHex}`;
}

export function hexStringToBytes32Point(
  hexString: string,
): Result<Bytes32Point, string> {
  if (hexString.length !== 64) {
    return {
      success: false,
      err: "Invalid hex string length",
    };
  }

  const xRes = Bytes.fromHexString(hexString.slice(0, 32), 32);
  if (!xRes.success) {
    return {
      success: false,
      err: "Invalid hex string",
    };
  }

  const yRes = Bytes.fromHexString(hexString.slice(32), 32);
  if (!yRes.success) {
    return {
      success: false,
      err: "Invalid hex string",
    };
  }

  return {
    success: true,
    data: {
      x: xRes.data,
      y: yRes.data,
    },
  };
}
