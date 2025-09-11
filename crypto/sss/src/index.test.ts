import * as secp from "@noble/secp256k1";
import Polynomial from "polynomial";
import * as galois from "@guildofweavers/galois";

// const prime = 2 ^ 256 − 2 ^ 32 − 977

describe("sss_test_1", () => {
  it("t", () => {
    console.log(123);

    const field = galois.createPrimeField(2n ** 256n - 351n * 2n ** 32n + 1n);
    const a = field.rand();

    console.log(11, a);
  });
});
