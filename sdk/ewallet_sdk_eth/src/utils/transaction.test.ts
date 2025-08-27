import type { RpcTransactionRequest } from "viem";

import {
  toSignableTransaction,
  isSignableTransaction,
} from "@keplr-ewallet-sdk-eth/utils";

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
