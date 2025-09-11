import { Result } from "@keplr-ewallet/stdlib-js";
import { Bytes, Bytes32 } from "@keplr-ewallet/bytes";
import * as galois from "@guildofweavers/galois";

import { Bytes32Point } from "./point";
import { SECP256K1_ORDER } from "./curve_order";

export function combine(
  points: Bytes32Point[],
  t: number,
): Result<Bytes32, string> {
  const n = points.length;
  if (n <= 0 || t <= 0 || t > n) {
    return {
      success: false,
      err: "Invalid parameters N or T",
    };
  }

  const field = galois.createPrimeField(SECP256K1_ORDER);

  const truncatedPoints = points.slice(0, t);

  const xs = field.newVectorFrom(
    truncatedPoints.map((point) => point.x.toBigInt()),
  );
  const ys = field.newVectorFrom(
    truncatedPoints.map((point) => point.y.toBigInt()),
  );

  const interpolatedPolynomial = field.interpolate(xs, ys);
  const secret = field.evalPolyAt(interpolatedPolynomial, 0n);

  // validate rest points
  const restPoints = points.slice(t);
  for (const point of restPoints) {
    const x = point.x.toBigInt();
    const y = field.evalPolyAt(interpolatedPolynomial, x);
    if (y !== point.y.toBigInt()) {
      return {
        success: false,
        err: "Failed to interpolate polynomial: invalid points",
      };
    }
  }

  const secretBytes = Bytes.fromBigInt(secret, 32);
  if (!secretBytes.success) {
    return {
      success: false,
      err: "Failed to convert secret to Bytes",
    };
  }

  return {
    success: true,
    data: secretBytes.data,
  };
}
