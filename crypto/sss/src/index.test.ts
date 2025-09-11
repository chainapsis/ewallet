import * as secp from "@noble/secp256k1";
import Polynomial from "polynomial";
import * as galois from "@guildofweavers/galois";

// const prime = 2 ^ 256 − 2 ^ 32 − 977
const DEGREE = 5;
const N = 10;
const T = DEGREE + 1;
const COEFFICIENTS_COUNT = T;

describe("sss_test_1", () => {
  it("sss_gf_secp256k1", () => {
    const field = galois.createPrimeField(2n ** 256n - 351n * 2n ** 32n + 1n);

    // 1. Random sample a polynomial
    const coeffs = [];
    for (let idx = 0; idx < COEFFICIENTS_COUNT; idx += 1) {
      const coeff = field.rand();
      coeffs.push(coeff);
    }
    console.log("coeffs: ", coeffs);

    const polynomial = field.newVectorFrom(coeffs);

    // 2. Random sample points of length N
    // [x0, y0], [x1, y1], ...
    const xSamples: bigint[] = [];
    for (let idx = 0; idx < N; idx += 1) {
      xSamples.push(BigInt(idx + 1));
    }
    const xsVector = field.newVectorFrom(xSamples);
    console.log("xsVector: ", xsVector);

    const ySamples: bigint[] = [];
    for (let idx = 0; idx < N; idx += 1) {
      const y = field.evalPolyAt(polynomial, xsVector.getValue(idx));
      ySamples.push(y);
    }
    console.log("ySamples: ", ySamples);

    const ysVector = field.newVectorFrom(ySamples);

    // 3. Interpolate the original polynomial using the points (2)

    const truncatedXs = field.truncateVector(xsVector, T);
    const truncatedYs = field.truncateVector(ysVector, T);

    const interpolatedPolynomial = field.interpolate(truncatedXs, truncatedYs);

    interpolatedPolynomial.toBuffer().equals(polynomial.toBuffer());
    expect(
      interpolatedPolynomial.toBuffer().equals(polynomial.toBuffer()),
    ).toBe(true);

    // 4. Evaluate at x=0

    const x = field.newVectorFrom([0n]);
    const y = field.evalPolyAt(interpolatedPolynomial, x.getValue(0));
    console.log("Private key: ", y.toString(16));
    expect(y.toString(16).length).toBe(64);
  });

  it("t2", () => {
    console.log(123);

    // 1. User talks to Keplr how to split her key
    // Keplr responds as
    // [
    //   {
    //     index: '632049623304950394n'
    //     endpoint: 'https://123.123.123.1"
    //   },
    //   {
    //      index: '460345609384506390n'
    //      endpoint: 'https://123.123.123.1"
    //   },
    //   ...
    // ]

    // 2. User splits her key then sends them over to KS nodes
    // Keplr remembers the fact that the user handed over to N KS nodes
  });

  it("t3", () => {
    console.log(123);

    // 1. User talks to Keplr how to retreive her key shares
    // Keplr responds as
    // {
    //   ks_nodes: [
    //     {
    //       index: '632049623304950394n'
    //       endpoint: 'https://123.123.123.1"
    //     },
    //     {
    //        index: '460345609384506390n'
    //        endpoint: 'https://123.123.123.1"
    //     },
    //     ...
    //   ]
    // }

    // 2. User asks ks nodes then combine the key
    //
    //
    // 3. In the event where a new KS node emerges,
    // Keplr responds as
    // {
    //   create_new_key_shares_required: [
    //     index: '632049623304950394n'
    //     endpoint: 'https://123.123.123.1"
    //   ],
    //   {
    //     index: '632049623304950394n'
    //     endpoint: 'https://123.123.123.1"
    //   },
    // }
  });
});
