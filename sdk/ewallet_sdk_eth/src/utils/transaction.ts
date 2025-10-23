import type { Hex, RpcTransactionRequest, TransactionSerializable } from "viem";
import { isHex, toHex } from "viem";

import { parseChainId } from "./utils";

/**
 * Normalize Ethereum JSON-RPC QUANTITY values to 0x-prefixed hex without leading zeros
 * @param input - The input to normalize
 * @returns The normalized value
 * @dev
 */
function normalizeQuantity(
  input: string | number | bigint | null | undefined,
): Hex | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }

  if (typeof input === "bigint") {
    return toHex(input);
  }

  if (typeof input === "number") {
    const n = Number.isFinite(input) ? Math.max(0, Math.floor(input)) : 0;
    return toHex(n);
  }

  let s = input.trim();
  if (s.length === 0 || s === "0x") {
    return undefined;
  }

  let q: bigint;
  try {
    q = BigInt(s);
  } catch {
    try {
      const hexCandidate = isHex(s) ? s : `0x${s}`;
      q = BigInt(hexCandidate);
    } catch {
      return undefined;
    }
  }

  return toHex(q);
}

function normalizeDataHex(input: string | undefined | null): Hex | undefined {
  if (input === null || input === undefined) {
    return undefined;
  }
  let s = input.trim();
  if (s.length === 0) {
    return undefined;
  }
  if (!isHex(s)) {
    s = `0x${s}`;
  }
  return s as `0x${string}`;
}

export function toSignableTransaction(
  tx: RpcTransactionRequest,
): RpcTransactionRequest {
  const { from, ...transaction } = tx;
  const txType = transaction.type || "0x2"; // Default to EIP-1559

  const baseFields = {
    to: transaction.to,
    data: normalizeDataHex(transaction.data),
    gas: normalizeQuantity(transaction.gas),
    nonce: normalizeQuantity(transaction.nonce),
    value: normalizeQuantity(transaction.value),
  };

  let signableTransaction: RpcTransactionRequest;

  switch (txType) {
    case "0x0":
      signableTransaction = {
        ...baseFields,
        type: "0x0",
        gasPrice: normalizeQuantity(transaction.gasPrice),
      };
      break;
    case "0x1":
      signableTransaction = {
        ...baseFields,
        type: "0x1",
        gasPrice: normalizeQuantity(transaction.gasPrice),
        accessList: transaction.accessList || [],
      };
      break;
    case "0x2":
    default:
      signableTransaction = {
        ...baseFields,
        type: "0x2",
        maxPriorityFeePerGas: normalizeQuantity(
          transaction.maxPriorityFeePerGas,
        ),
        maxFeePerGas: normalizeQuantity(transaction.maxFeePerGas),
      };
      break;
  }

  return signableTransaction;
}

export function isSignableTransaction(tx: RpcTransactionRequest): boolean {
  if (!tx || typeof tx !== "object") {
    return false;
  }

  if (tx.from != null) {
    return false;
  }

  const txType = tx.type || "0x2";

  const has = (key: keyof RpcTransactionRequest) =>
    tx[key] !== undefined && tx[key] !== null;

  switch (txType) {
    case "0x0":
      // Legacy: requires gasPrice; must not include EIP-1559 fee fields
      return (
        has("gasPrice") && !has("maxFeePerGas") && !has("maxPriorityFeePerGas")
      );
    case "0x1":
      // EIP-2930: requires gasPrice and accessList array; no EIP-1559 fee fields
      return (
        has("gasPrice") &&
        Array.isArray(tx.accessList ?? []) &&
        !has("maxFeePerGas") &&
        !has("maxPriorityFeePerGas")
      );
    case "0x2":
    default:
      // EIP-1559: requires both fee fields; must not include legacy gasPrice
      return (
        has("maxFeePerGas") && has("maxPriorityFeePerGas") && !has("gasPrice")
      );
  }
}

export function toTransactionSerializable({
  chainId,
  tx,
}: {
  chainId: string;
  tx: RpcTransactionRequest;
}): TransactionSerializable {
  const convertValue = <T>(
    value: string | number | undefined,
    converter: (value: string | number) => T,
    defaultValue?: T,
  ): T | undefined => (value !== undefined ? converter(value) : defaultValue);

  const { from, ...transaction } = tx;
  const txType = transaction.type || "0x2"; // Default to EIP-1559

  const chainIdNumber = parseChainId(chainId);

  const baseFields = {
    chainId: chainIdNumber,
    to: transaction.to || null,
    data: transaction.data,
    gas: convertValue(transaction.gas, BigInt),
    nonce: convertValue(transaction.nonce, (value) =>
      parseInt(value.toString(), 16),
    ),
    value: convertValue(transaction.value, BigInt) || BigInt(0),
  };

  const typeMapping: { [key: string]: "legacy" | "eip2930" | "eip1559" } = {
    "0x0": "legacy",
    "0x1": "eip2930",
    "0x2": "eip1559",
  };

  const mappedType = typeMapping[txType] || "eip1559";

  let transactionSerializable: TransactionSerializable;

  switch (mappedType) {
    case "legacy":
      transactionSerializable = {
        ...baseFields,
        type: "legacy",
        gasPrice: convertValue(transaction.gasPrice, BigInt),
      };
      break;
    case "eip2930":
      transactionSerializable = {
        ...baseFields,
        type: "eip2930",
        gasPrice: convertValue(transaction.gasPrice, BigInt),
        accessList: transaction.accessList || [],
      };
      break;
    case "eip1559":
    default:
      transactionSerializable = {
        ...baseFields,
        type: "eip1559",
        maxPriorityFeePerGas: convertValue(
          transaction.maxPriorityFeePerGas,
          BigInt,
        ),
        maxFeePerGas: convertValue(transaction.maxFeePerGas, BigInt),
      };
      break;
  }

  return transactionSerializable;
}

export function toRpcTransactionRequest(
  transaction: TransactionSerializable,
): RpcTransactionRequest {
  const convertToHexValue = (
    value: bigint | number | undefined,
  ): `0x${string}` | undefined => {
    if (value === undefined) {
      return undefined;
    }
    return toHex(value);
  };

  const baseFields = {
    to: transaction.to,
    data: transaction.data,
    value: convertToHexValue(transaction.value),
    gas: convertToHexValue(transaction.gas),
    nonce: convertToHexValue(transaction.nonce),
  };

  switch (transaction.type) {
    case "legacy":
      return {
        ...baseFields,
        type: "0x0",
        gasPrice: convertToHexValue(transaction.gasPrice),
      };
    case "eip2930":
      return {
        ...baseFields,
        type: "0x1",
        gasPrice: convertToHexValue(transaction.gasPrice),
        accessList: transaction.accessList,
      };
    case "eip1559":
    default:
      return {
        ...baseFields,
        type: "0x2",
        maxFeePerGas: convertToHexValue(transaction.maxFeePerGas),
        maxPriorityFeePerGas: convertToHexValue(
          transaction.maxPriorityFeePerGas,
        ),
      };
  }
}
