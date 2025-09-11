import * as secp from "@noble/secp256k1";
import Polynomial from "polynomial";

describe("sss_test_1", () => {
  it("t", () => {
    console.log(123);

    // secp;
    //
    // const ks_node_1_id = "crypto_1";
    // const ks_node_2_id = "crypto_2";

    const p = new Polynomial({ "3": 4, "5": "9" }); // 9x^5+4x^3
    console.log(1, p);

    // const bytes_1 = hash(ks_node_1_id);
    // const bytes_2 = hash(ks_node_2_id);

    // const y_1 = secp.Point.fromBytes(bytes_1);
    // const y_2 = secp.Point.fromBytes(bytes_2);
  });
});
