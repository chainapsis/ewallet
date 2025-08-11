import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { concat, keccak256, pad, parseUnits, toHex } from "viem";
import type {
  Address,
  Chain,
  EstimateGasParameters,
  Hex,
  PublicClient,
  RpcTransactionRequest,
  StateOverride,
} from "viem";

import type {
  NonceValue,
  GasEstimationValue,
  SimulationStepUpdate,
} from "@keplr-ewallet-attached/store/ethereum_tx";

export interface UseGetGasEstimationProps {
  simulationKey: string;
  signer: Address;
  rpcTxRequest: RpcTransactionRequest;
  chain?: Chain;
  nonce?: NonceValue;
  multiplier?: number;
  client?: PublicClient;
  refetchInterval?: number;
  retry?: boolean;
  updateStepStatus?: (
    key: string,
    stepName: "gasEstimation",
    status: SimulationStepUpdate<GasEstimationValue>,
  ) => void;
  hostOrigin?: string;
}

export const useGetGasEstimation = ({
  simulationKey,
  signer,
  rpcTxRequest,
  nonce,
  chain,
  multiplier = 1.5,
  client,
  refetchInterval = 1000 * 12,
  retry = false,
  updateStepStatus,
  hostOrigin,
}: UseGetGasEstimationProps): UseQueryResult<GasEstimationValue> => {
  const isDemo =
    !!hostOrigin && hostOrigin === import.meta.env.VITE_DEMO_WEB_ORIGIN;

  const clampedMultiplier = Math.max(1, Math.min(3, multiplier));

  return useQuery({
    queryKey: ["estimateGas", simulationKey, signer, nonce, chain?.id],
    queryFn: async (): Promise<GasEstimationValue> => {
      if (!client) throw new Error("No public client available");

      updateStepStatus?.(simulationKey, "gasEstimation", {
        loading: true,
        error: null,
      });

      try {
        const txForEstimation: EstimateGasParameters = {
          account: signer,
          to: rpcTxRequest.to,
          data: rpcTxRequest.data,
          value: rpcTxRequest.value ? BigInt(rpcTxRequest.value) : undefined,
          nonce,
        };

        let stateOverride: StateOverride = [];

        // NOTE: If demo, set balance of the signer to 1 USDC
        // this is only for demo purpose
        if (isDemo) {
          stateOverride = getDemoStateOverride(signer, rpcTxRequest);
        }

        // CHECK: ethereum mainnet gas estimation query is sometimes too slow
        // as of now, we just use the public rpc endpoint for gas estimation
        // and state override might slow down the query response time
        // chain info management should be improved before production release
        const estimatedGas = await client.estimateGas({
          ...txForEstimation,
          stateOverride,
        });

        updateStepStatus?.(simulationKey, "gasEstimation", {
          loading: false,
          error: null,
          value:
            (estimatedGas * BigInt(Math.floor(clampedMultiplier * 1000))) /
            BigInt(1000),
        });

        return estimatedGas;
      } catch (error) {
        console.error("Gas estimation failed:", error);
        updateStepStatus?.(simulationKey, "gasEstimation", {
          value: null,
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Failed to estimate gas"),
        });
        throw error;
      }
    },
    enabled: nonce !== undefined && nonce >= 0 && !!client,
    refetchInterval,
    retry,
  });
};

const getDemoStateOverride = (
  signer: Address,
  rpcTxRequest: RpcTransactionRequest,
) => {
  const stateOverride: StateOverride = [];

  const USDC_BALANCES_SLOT = 9n;

  const getUsdcBalanceSlot = (addr: Address): Hex => {
    // pad address to 32 bytes
    const paddedKey = pad(addr, { size: 32 });
    // pad slot index to 32 bytes
    const paddedSlot = pad(toHex(USDC_BALANCES_SLOT), { size: 32 });
    // concat padded key and slot then hash
    return keccak256(concat([paddedKey, paddedSlot]));
  };

  const desiredBalance = parseUnits("1", 6);
  const desiredBalance32 = pad(toHex(desiredBalance), { size: 32 });

  // calculate slot for state override
  const slotForSender = getUsdcBalanceSlot(signer);

  stateOverride.push({
    address: rpcTxRequest.to!,
    stateDiff: [
      {
        slot: slotForSender,
        value: desiredBalance32,
      },
    ],
  });

  return stateOverride;
};
