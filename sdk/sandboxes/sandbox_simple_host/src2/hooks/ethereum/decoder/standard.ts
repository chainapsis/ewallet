import type { Address, Hex, PublicClient } from "viem";
import { decodeFunctionData } from "viem";

import {
  ERC165_ABI,
  ERC20_WRITE_FUNCTIONS_ABI,
  ERC721_WRITE_FUNCTIONS_ABI,
  ERC1155_WRITE_FUNCTIONS_ABI,
  ERC20_INTERFACE_ID,
  ERC721_INTERFACE_ID,
  ERC1155_INTERFACE_ID,
} from "./constants";

export type CheckStandardResult = {
  isERC20: boolean;
  isERC721: boolean;
  isERC1155: boolean;
};

/**
 * Guess the standard of the contract by the calldata,
 * supported standards are ERC20, ERC721, ERC1155 as of now
 *
 * @param calldata - calldata to guess the standard
 * @returns { isERC20: boolean, isERC721: boolean, isERC1155: boolean }
 */
export function guessStandardByAbi(calldata: Hex): CheckStandardResult {
  // priority: ERC20 > ERC721 > ERC1155, some methods have same signature
  try {
    const decoded = decodeFunctionData({
      abi: ERC20_WRITE_FUNCTIONS_ABI,
      data: calldata,
    });
    if (decoded.functionName === "transfer") {
      return { isERC20: true, isERC721: false, isERC1155: false };
    }

    // common function name ERC20 & ERC721: transferFrom, approve
    return { isERC20: true, isERC721: true, isERC1155: false };
  } catch {}

  try {
    const decoded = decodeFunctionData({
      abi: ERC721_WRITE_FUNCTIONS_ABI,
      data: calldata,
    });
    // common function name ERC721 & ERC1155: setApprovalForAll
    if (decoded.functionName === "setApprovalForAll") {
      return { isERC20: false, isERC721: true, isERC1155: true };
    }

    return { isERC20: false, isERC721: true, isERC1155: false };
  } catch {}

  try {
    decodeFunctionData({ abi: ERC1155_WRITE_FUNCTIONS_ABI, data: calldata });
    return { isERC20: false, isERC721: false, isERC1155: true };
  } catch {}
  return { isERC20: false, isERC721: false, isERC1155: false };
}

export async function checkSupportStandard(
  client: PublicClient,
  address: Address,
  calldata?: Hex,
): Promise<{
  isERC20: boolean;
  isERC721: boolean;
  isERC1155: boolean;
}> {
  try {
    // a lot of contracts might not support ERC165 (e.g. USDC, USDT, etc.)
    const isERC20 = await client.readContract({
      address,
      abi: ERC165_ABI,
      functionName: "supportsInterface",
      args: [ERC20_INTERFACE_ID],
    });
    if (isERC20) {
      return {
        isERC20: true,
        isERC721: false,
        isERC1155: false,
      };
    }

    const isERC721 = await client.readContract({
      address,
      abi: ERC165_ABI,
      functionName: "supportsInterface",
      args: [ERC721_INTERFACE_ID],
    });
    if (isERC721) {
      return {
        isERC20: false,
        isERC721: true,
        isERC1155: false,
      };
    }

    const isERC1155 = await client.readContract({
      address,
      abi: ERC165_ABI,
      functionName: "supportsInterface",
      args: [ERC1155_INTERFACE_ID],
    });
    if (isERC1155) {
      return {
        isERC20: false,
        isERC721: false,
        isERC1155: true,
      };
    }

    // support erc165 but not erc20, erc721, erc1155
    // which means it is not an ERC20, ERC721, or ERC1155 token
    return {
      isERC20: false,
      isERC721: false,
      isERC1155: false,
    };
  } catch {
    // if decoded calldata not available, return false for all
    if (calldata) {
      return guessStandardByAbi(calldata);
    }

    return {
      isERC20: false,
      isERC721: false,
      isERC1155: false,
    };
  }
}
