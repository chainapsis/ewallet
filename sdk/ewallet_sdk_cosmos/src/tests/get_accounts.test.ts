import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { ChainInfo } from "@keplr-wallet/types";

import { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import { getAccounts } from "@keplr-ewallet-sdk-cosmos/api/get_accounts";
import {
  cosmosPublicKey,
  initiaPublicKey,
  expectedCosmosBech32Address,
  expectedInitiaBech32Address,
  cosmosHubChainInfo,
  initiaChainInfo,
} from "@keplr-ewallet-sdk-cosmos/tests/test-data";

describe("getAccounts", () => {
  let mockCosmosEWallet: CosmosEWallet;
  let mockGetPublicKey: jest.Mock<() => Promise<Uint8Array>>;
  let mockGetCosmosChainInfo: jest.Mock<() => Promise<ChainInfo[]>>;


  beforeEach(() => {
    // Create a mock CosmosEWallet instance
    mockCosmosEWallet = {} as CosmosEWallet;

    // Create mock methods (default to Cosmos data)
    mockGetPublicKey = jest
      .fn<() => Promise<Uint8Array>>()
      .mockResolvedValue(cosmosPublicKey);
    mockGetCosmosChainInfo = jest
      .fn<() => Promise<ChainInfo[]>>()
      .mockResolvedValue([cosmosHubChainInfo, initiaChainInfo]);

    // Assign mocks to the instance
    mockCosmosEWallet.getPublicKey = mockGetPublicKey;
    mockCosmosEWallet.getCosmosChainInfo = mockGetCosmosChainInfo;

    // Reset all mocks
    jest.clearAllMocks();
  });

  it("should return correct account data for cosmoshub-4 with cosmos key", async () => {
    // Test only Cosmos Hub with cosmos-specific key
    mockGetCosmosChainInfo.mockResolvedValue([cosmosHubChainInfo]);

    const result = await getAccounts.call(mockCosmosEWallet);

    expect(result).toHaveLength(1);

    // Verify Cosmos Hub account with actual address calculation
    expect(result[0]).toEqual({
      address: expectedCosmosBech32Address,
      algo: "secp256k1",
      pubkey: cosmosPublicKey,
    });

    // Verify method calls
    expect(mockGetPublicKey).toHaveBeenCalledTimes(1);
    expect(mockGetCosmosChainInfo).toHaveBeenCalledTimes(1);
  });

  it("should return correct account data for initia with ethereum-compatible key", async () => {
    // Test only Initia with initia-specific key
    mockGetPublicKey.mockResolvedValue(initiaPublicKey);
    mockGetCosmosChainInfo.mockResolvedValue([initiaChainInfo]);

    const result = await getAccounts.call(mockCosmosEWallet);

    expect(result).toHaveLength(1);

    // Verify Initia account with actual address calculation
    expect(result[0]).toEqual({
      address: expectedInitiaBech32Address,
      algo: "secp256k1", // Note: getAccounts always returns "secp256k1"
      pubkey: initiaPublicKey,
    });

    // Verify method calls
    expect(mockGetPublicKey).toHaveBeenCalledTimes(1);
    expect(mockGetCosmosChainInfo).toHaveBeenCalledTimes(1);
  });

  it("should verify cosmos and initia public key formats", async () => {
    // Verify the cosmos public key is 33 bytes (compressed secp256k1)
    expect(cosmosPublicKey).toHaveLength(33);
    expect(cosmosPublicKey[0]).toBe(2); // Starts with 0x02

    // Verify the Initia public key is 33 bytes (compressed secp256k1)
    expect(initiaPublicKey).toHaveLength(33);
    expect(initiaPublicKey[0]).toBe(3); // Starts with 0x03 (different from cosmos key)
  });

  it("should handle mixed chains with different key types", async () => {
    // Test scenario where we have multiple chains but use cosmos key
    // (In real usage, each chain would have its own appropriate key)

    const result = await getAccounts.call(mockCosmosEWallet);

    expect(result).toHaveLength(2);

    // Verify Cosmos Hub uses cosmos address derivation
    expect(result[0]).toEqual({
      address: expectedCosmosBech32Address,
      algo: "secp256k1",
      pubkey: cosmosPublicKey,
    });

    // Verify Initia uses ethereum address derivation but with cosmos public key
    // The address will be different since we're using cosmos key instead of initia key
    expect(result[1]).toEqual({
      address: expect.stringMatching(/^init1[a-z0-9]+$/), // Should be valid init address
      algo: "secp256k1",
      pubkey: cosmosPublicKey,
    });
  });

  it("should handle errors gracefully", async () => {
    const error = new Error("Failed to get public key");
    mockGetPublicKey.mockRejectedValue(error);

    await expect(getAccounts.call(mockCosmosEWallet)).rejects.toThrow(
      "Failed to get public key",
    );
  });
});
