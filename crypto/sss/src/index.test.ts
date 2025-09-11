import * as secp from "@noble/secp256k1";
import Polynomial from "polynomial";
import * as galois from "@guildofweavers/galois";

// const prime = 2 ^ 256 − 2 ^ 32 − 977
const DEGREE = 5;

describe("sss_test_1", () => {
  it("t", () => {
    console.log(123);

    const field = galois.createPrimeField(2n ** 256n - 351n * 2n ** 32n + 1n);

    const coeffs = [];
    for (let idx = 0; idx < DEGREE; idx += 1) {
      const coeff = field.rand();
      coeffs.push(coeff);
    }
    console.log("coeffs", coeffs);

    const v = field.newVectorFrom(coeffs);
    console.log(22, v);

    const y = field.evalPolyAt(v, 3n);
    console.log(11, y);

    // 1. Random sample a polynomial

    // 2. Random sample points of length N
    // [x0, y0], [x1, y1], ...

    // 3. Interpolate the original polynomial using the points (2)

    // 4. Evaluate at x=0
  });
});
