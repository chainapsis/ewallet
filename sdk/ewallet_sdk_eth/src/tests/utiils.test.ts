import { serializeSignature } from "viem/accounts";
import { type RpcTransactionRequest, recoverPublicKey } from "viem";

import {
  publicKeyToEthereumAddress,
  encodeEthereumSignature,
  toSignableTransaction,
  isSignableTransaction,
} from "@keplr-ewallet-sdk-eth/utils";

describe("encodeEthereumSignature", () => {
  it("should encode the signature correctly", async () => {
    const compressedPublicKey =
      "0268d39a99cf77adba08a28877900023513f6e49b702901fb53a90d9c1187e1aa4";
    const address = publicKeyToEthereumAddress(`0x${compressedPublicKey}`);

    const msgHash =
      "d7ed35dd0510a611f63230dabd98e34dcfca9fda4e086083a0741e50a247249d"; // hashMessage("hello world!")

    const signOutput = {
      sig: {
        big_r:
          "0220FF16EBC6DA287D0C059F809A9F4AC23BC238CF17F4D2F361FBFEFE9ECC0A46",
        s: "59AE4813A391DBA17C3509DA80AF0AA866D16406075202654DD3A17E912C19DF",
      },
      is_high: true,
    };

    const signature = encodeEthereumSignature(signOutput);

    expect(signature).toHaveProperty("r");
    expect(signature).toHaveProperty("s");
    expect(signature).toHaveProperty("v");
    expect(signature.r).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(signature.s).toMatch(/^0x[0-9a-fA-F]{64}$/);
    expect(typeof signature.v).toBe("bigint");

    const serializedSignature = serializeSignature(signature);

    // recovered public key should be uncompressed
    const recoveredPublicKey = await recoverPublicKey({
      hash: `0x${msgHash}`,
      signature: serializedSignature,
    });

    // 0x04 is the prefix for uncompressed public key
    // length is 128 because it's 64 bytes (32 bytes for x and 32 bytes for y) without hex prefix 0x04
    expect(recoveredPublicKey).toMatch(/^0x04[0-9a-fA-F]{128}$/);

    const recoveredAddress = publicKeyToEthereumAddress(recoveredPublicKey);

    expect(recoveredAddress).toBe(address);
  });
});

describe("toSignableTransaction", () => {
  it("produces legacy (0x0) signable tx with gasPrice", () => {
    const tx: RpcTransactionRequest = {
      from: "0x0000000000000000000000000000000000000001",
      to: "0x0000000000000000000000000000000000000002",
      type: "0x0",
      gas: "0x5208",
      gasPrice: "0x3b9aca00",
      nonce: "0x1",
      value: "0x0",
      data: "0x",
    };

    const signable = toSignableTransaction(tx);

    expect(signable.type).toBe("0x0");
    expect(signable.from).toBeUndefined();
    expect(signable.gasPrice).toBe("0x3b9aca00");
    expect(signable.maxFeePerGas).toBeUndefined();
    expect(signable.maxPriorityFeePerGas).toBeUndefined();
  });

  it("produces EIP-2930 (0x1) signable tx with gasPrice & accessList", () => {
    const tx: RpcTransactionRequest = {
      from: "0x0000000000000000000000000000000000000001",
      to: "0x0000000000000000000000000000000000000002",
      type: "0x1",
      gas: "0x5208",
      gasPrice: "0x3b9aca00",
      accessList: [],
      nonce: "0x1",
      value: "0x0",
      data: "0x",
    };

    const signable = toSignableTransaction(tx);

    expect(signable.type).toBe("0x1");
    expect(signable.from).toBeUndefined();
    expect(signable.gasPrice).toBe("0x3b9aca00");
    expect(signable.accessList).toEqual([]);
    expect(signable.maxFeePerGas).toBeUndefined();
    expect(signable.maxPriorityFeePerGas).toBeUndefined();
  });

  it("produces EIP-1559 (0x2) signable tx with fee fields and no gasPrice", () => {
    const tx: RpcTransactionRequest = {
      from: "0x0000000000000000000000000000000000000001",
      to: "0x0000000000000000000000000000000000000002",
      type: "0x2",
      gas: "0x5208",
      maxFeePerGas: "0x59682f00",
      maxPriorityFeePerGas: "0x3b9aca00",
      nonce: "0x1",
      value: "0x0",
      data: "0x",
    };

    const signable = toSignableTransaction(tx);

    expect(signable.type).toBe("0x2");
    expect(signable.from).toBeUndefined();
    expect(signable.maxFeePerGas).toBe("0x59682f00");
    expect(signable.maxPriorityFeePerGas).toBe("0x3b9aca00");
    expect(signable.gasPrice).toBeUndefined();
  });

  it("defaults to EIP-1559 (0x2) when type is missing", () => {
    const tx: RpcTransactionRequest = {
      from: "0x0000000000000000000000000000000000000001",
      to: "0x0000000000000000000000000000000000000002",
      gas: "0x5208",
      maxFeePerGas: "0x59682f00",
      maxPriorityFeePerGas: "0x3b9aca00",
      nonce: "0x1",
      value: "0x0",
      data: "0x",
    };

    const signable = toSignableTransaction(tx);
    expect(signable.type).toBe("0x2");
  });
});

describe("isSignableTransaction", () => {
  it("returns true for legacy signable tx", () => {
    const tx: RpcTransactionRequest = {
      to: "0x0000000000000000000000000000000000000002",
      type: "0x0",
      gas: "0x5208",
      gasPrice: "0x3b9aca00",
      nonce: "0x1",
      value: "0x0",
      data: "0x",
    };
    expect(isSignableTransaction(tx)).toBe(true);
  });

  it("returns true for EIP-2930 signable tx", () => {
    const tx: RpcTransactionRequest = {
      to: "0x0000000000000000000000000000000000000002",
      type: "0x1",
      gas: "0x5208",
      gasPrice: "0x3b9aca00",
      accessList: [],
      nonce: "0x1",
      value: "0x0",
      data: "0x",
    };
    expect(isSignableTransaction(tx)).toBe(true);
  });

  it("returns true for EIP-1559 signable tx", () => {
    const tx: RpcTransactionRequest = {
      to: "0x0000000000000000000000000000000000000002",
      type: "0x2",
      gas: "0x5208",
      maxFeePerGas: "0x59682f00",
      maxPriorityFeePerGas: "0x3b9aca00",
      nonce: "0x1",
      value: "0x0",
      data: "0x",
    };
    expect(isSignableTransaction(tx)).toBe(true);
  });

  it("rejects tx that includes from", () => {
    const tx: RpcTransactionRequest = {
      from: "0x0000000000000000000000000000000000000001",
      to: "0x0000000000000000000000000000000000000002",
      type: "0x2",
      gas: "0x5208",
      maxFeePerGas: "0x59682f00",
      maxPriorityFeePerGas: "0x3b9aca00",
      nonce: "0x1",
      value: "0x0",
      data: "0x",
    };
    expect(isSignableTransaction(tx)).toBe(false);
  });

  it("rejects invalid fee field combinations", () => {
    const invalidLegacy: RpcTransactionRequest = {
      type: "0x0",
      gas: "0x5208",
      maxFeePerGas: "0x59682f00",
    } as any;
    const invalid2930: RpcTransactionRequest = {
      type: "0x1",
      gas: "0x5208",
      gasPrice: "0x3b9aca00",
      accessList: [],
      maxPriorityFeePerGas: "0x3b9aca00",
    } as any;
    const invalid1559_a: RpcTransactionRequest = {
      type: "0x2",
      gas: "0x5208",
      maxFeePerGas: "0x59682f00",
      gasPrice: "0x3b9aca00",
    } as any;
    const invalid1559_b: RpcTransactionRequest = {
      type: "0x2",
      gas: "0x5208",
      maxPriorityFeePerGas: "0x3b9aca00",
    } as any;

    expect(isSignableTransaction(invalidLegacy)).toBe(false);
    expect(isSignableTransaction(invalid2930)).toBe(false);
    expect(isSignableTransaction(invalid1559_a)).toBe(false);
    expect(isSignableTransaction(invalid1559_b)).toBe(false);
  });
});
