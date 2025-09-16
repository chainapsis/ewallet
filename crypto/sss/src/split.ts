import { Bytes, Bytes32 } from "@keplr-ewallet/bytes";
import { Result } from "@keplr-ewallet/stdlib-js";
import * as galois from "@guildofweavers/galois";

import { Bytes32Point } from "./point";
import { SECP256K1_ORDER } from "./curve_order";

export function split(
  secret: Bytes32,
  ksNodeHashes: Bytes32[],
  t: number,
): Result<Bytes32Point[], string> {
  const n = ksNodeHashes.length;
  if (n <= 0 || t <= 0 || t > n) {
    return {
      success: false,
      err: "Invalid parameters N or T",
    };
  }

  const field = galois.createPrimeField(SECP256K1_ORDER);

  const coeffs: bigint[] = [secret.toBigInt()];
  for (let idx = 1; idx < t; idx += 1) {
    const coeff = field.rand();
    coeffs.push(coeff);
  }

  const polynomial = field.newVectorFrom(coeffs);

  const points: Bytes32Point[] = [];
  for (let idx = 0; idx < n; idx += 1) {
    const xCoord = ksNodeHashes[idx].toBigInt();
    const yCoord = field.evalPolyAt(polynomial, xCoord);
    const yRes = Bytes.fromBigInt(yCoord, 32);
    if (!yRes.success) {
      return {
        success: false,
        err: "Failed to convert yCoord to Bytes",
      };
    }

    points.push({
      x: ksNodeHashes[idx],
      y: yRes.data,
    });
  }

  return {
    success: true,
    data: points,
  };
}
