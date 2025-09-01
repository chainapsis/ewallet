import type {
  Hex,
  Address,
  ByteArray,
  AddEthereumChainParameter as RpcChain,
} from "viem";
import { publicKeyToAddress } from "viem/accounts";
import { secp256k1 } from "@noble/curves/secp256k1";

export function publicKeyToEthereumAddress(
  publicKey: Hex | ByteArray,
): Address {
  let publicKeyWithout0x: string | ByteArray = publicKey;
  if (typeof publicKey === "string" && publicKey.startsWith("0x")) {
    publicKeyWithout0x = publicKey.slice(2);
  } else {
    publicKeyWithout0x = Buffer.from(publicKey).toString("hex");
  }

  const point = secp256k1.Point.fromHex(publicKeyWithout0x);

  const uncompressedPublicKey: Hex = `0x${point.toHex(false)}`;

  // ethereum address should be generated from uncompressed public key
  return publicKeyToAddress(uncompressedPublicKey);
}

export function isValidChainId(chainId: unknown): chainId is string {
  return (
    Boolean(chainId) && typeof chainId === "string" && chainId.startsWith("0x")
  );
}

/**
 * Check if a URL string is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate chain ID format and value
 * @param chainId - The chain ID to validate
 * @returns Object with validation result and decimal value
 */
export function validateChainIdFormat(chainId: string): {
  isValid: boolean;
  decimalValue?: number;
  error?: string;
} {
  try {
    const decimalChainId = parseInt(chainId, 16);

    // Ensure the chain ID is a 0x-prefixed hexadecimal string and can be parsed to an integer
    if (!/^0x[0-9a-fA-F]+$/.test(chainId) || isNaN(decimalChainId)) {
      return { isValid: false, error: "Invalid chain ID format" };
    }

    // Validate chain ID value is not greater than max safe integer value
    if (decimalChainId > Number.MAX_SAFE_INTEGER) {
      return {
        isValid: false,
        error: "Chain ID value exceeds maximum safe integer",
      };
    }

    return { isValid: true, decimalValue: decimalChainId };
  } catch (error) {
    return { isValid: false, error: "Invalid chain ID format" };
  }
}

/**
 * Validate RPC URLs array
 * @param rpcUrls - Array of RPC URLs to validate
 * @returns Validation result
 */
export function validateRpcUrls(rpcUrls: readonly string[]): {
  isValid: boolean;
  error?: string;
} {
  if (!rpcUrls || rpcUrls.length === 0) {
    return { isValid: false, error: "RPC URLs are required" };
  }

  for (const url of rpcUrls) {
    if (!isValidUrl(url)) {
      return { isValid: false, error: `Invalid RPC URL: ${url}` };
    }
  }

  return { isValid: true };
}

/**
 * Validate block explorer URLs array
 * @param blockExplorerUrls - Array of block explorer URLs to validate
 * @returns Validation result
 */
export function validateBlockExplorerUrls(
  blockExplorerUrls?: readonly string[],
): {
  isValid: boolean;
  error?: string;
} {
  if (!blockExplorerUrls) {
    return { isValid: true }; // Optional field
  }

  if (!Array.isArray(blockExplorerUrls) || blockExplorerUrls.length === 0) {
    return {
      isValid: false,
      error: "Block explorer URLs must be a non-empty array",
    };
  }

  for (const url of blockExplorerUrls) {
    if (!isValidUrl(url)) {
      return { isValid: false, error: `Invalid block explorer URL: ${url}` };
    }
  }

  return { isValid: true };
}

/**
 * Validate native currency symbol
 * @param symbol - The currency symbol to validate
 * @returns Validation result
 */
export function validateNativeCurrencySymbol(symbol: string): {
  isValid: boolean;
  error?: string;
} {
  if (symbol.length < 2 || symbol.length > 6) {
    return {
      isValid: false,
      error: "Native currency symbol must be between 2-6 characters",
    };
  }

  return { isValid: true };
}

/**
 * Validate chain information
 * @param chain - The chain to validate
 * @returns Validation result with error
 */
export function validateChain(chain: RpcChain): {
  isValid: boolean;
  error?: string;
} {
  const { rpcUrls, blockExplorerUrls, chainId, nativeCurrency } = chain;

  // Validate chain ID format and value
  const chainIdResult = validateChainIdFormat(chainId);
  if (!chainIdResult.isValid) {
    return {
      isValid: false,
      error: chainIdResult.error,
    };
  }

  // Validate RPC URLs
  const rpcResult = validateRpcUrls(rpcUrls);
  if (!rpcResult.isValid) {
    return {
      isValid: false,
      error: rpcResult.error,
    };
  }

  // Validate block explorer URLs
  const blockExplorerResult = validateBlockExplorerUrls(blockExplorerUrls);
  if (!blockExplorerResult.isValid) {
    return {
      isValid: false,
      error: blockExplorerResult.error,
    };
  }

  // Validate native currency
  if (nativeCurrency) {
    const symbolResult = validateNativeCurrencySymbol(nativeCurrency.symbol);
    if (!symbolResult.isValid) {
      return {
        isValid: false,
        error: symbolResult.error,
      };
    }
  }

  return { isValid: true };
}
