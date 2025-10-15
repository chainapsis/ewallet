export enum RpcErrorCode {
  InvalidInput = -32000,
  ResourceNotFound = -32001,
  ResourceUnavailable = -32002,
  TransactionRejected = -32003,
  MethodNotSupported = -32004,
  LimitExceeded = -32005,
  Parse = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  Internal = -32603,
}

export enum ProviderRpcErrorCode {
  UserRejectedRequest = 4001,
  Unauthorized = 4100,
  UnsupportedMethod = 4200,
  Disconnected = 4900,
  ChainDisconnected = 4901,
  UnsupportedChain = 4902,
}

export class EthereumRpcError extends Error {
  code: number;
  data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    if (!Number.isInteger(code)) {
      throw new Error('"code" must be an integer.');
    }
    if (!message || typeof message !== "string") {
      throw new Error('"message" must be a nonempty string.');
    }

    super(message);
    this.code = code;
    if (data !== undefined) {
      this.data = data;
    }
  }
}

/**
 * Checks if the error is a connection error
 * @param error - The error to check
 * @returns True if the error is a connection error, false otherwise
 */
export function isConnectionError(error: any): boolean {
  if (error?.name === "TypeError" || error instanceof TypeError) {
    const message = error.message?.toLowerCase() || "";
    if (
      message.includes("fetch failed") ||
      message.includes("failed to fetch") ||
      message.includes("network error") ||
      message.includes("load failed") ||
      message.includes("networkerror when attempting to fetch")
    ) {
      return true;
    }
  }

  if (error instanceof SyntaxError && error.message?.includes("JSON")) {
    return true;
  }

  if (
    error?.code === ProviderRpcErrorCode.Disconnected ||
    error?.code === ProviderRpcErrorCode.ChainDisconnected
  ) {
    return true;
  }

  if (error?.name === "AbortError") {
    return true;
  }

  return false;
}
