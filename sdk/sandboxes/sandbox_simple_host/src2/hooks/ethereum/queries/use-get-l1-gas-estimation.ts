import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Address, Chain, PublicClient, RpcTransactionRequest } from "viem";
import { SUPPORTED_OP_STACK_CHAINS } from "@keplr-ewallet/ewallet-sdk-eth";
import { publicActionsL2 } from "viem/op-stack";

import type {
  L1GasEstimationValue,
  NonceValue,
  SimulationStepUpdate,
} from "@keplr-ewallet-attached/store/ethereum_tx";

export interface UseGetL1GasEstimationProps {
  simulationKey: string;
  signer: Address;
  rpcTxRequest: RpcTransactionRequest;
  chain?: Chain;
  nonce?: NonceValue;
  client?: PublicClient;
  refetchInterval?: number;
  retry?: boolean;
  updateStepStatus?: (
    key: string,
    stepName: "l1GasEstimation",
    status: SimulationStepUpdate<L1GasEstimationValue>,
  ) => void;
}

export const useGetL1GasEstimation = ({
  simulationKey,
  signer,
  rpcTxRequest,
  chain,
  nonce,
  client,
  refetchInterval = 1000 * 12,
  retry = false,
  updateStepStatus,
}: UseGetL1GasEstimationProps): UseQueryResult<L1GasEstimationValue> => {
  const shouldEstimateL1Fee =
    chain &&
    SUPPORTED_OP_STACK_CHAINS.find(
      (opStackChain) => opStackChain.id === chain.id,
    ) !== undefined;

  return useQuery({
    queryKey: [
      "estimateL1Gas",
      simulationKey,
      nonce,
      chain?.id,
      shouldEstimateL1Fee,
    ],
    queryFn: async () => {
      if (!client) throw new Error("No public client available");

      // if not op stack chain, skip l1 gas estimation
      // this check is required as attempted is not updated when query is disabled
      if (!shouldEstimateL1Fee) {
        updateStepStatus?.(simulationKey, "l1GasEstimation", {
          value: null,
          loading: false,
          error: null,
        });
        return null;
      }

      updateStepStatus?.(simulationKey, "l1GasEstimation", {
        loading: true,
        error: null,
      });

      const l2Client = client.extend(publicActionsL2());

      try {
        const l1Gas = await l2Client.estimateL1Gas({
          chain,
          account: signer,
          to: rpcTxRequest.to,
          data: rpcTxRequest.data,
          value: rpcTxRequest.value ? BigInt(rpcTxRequest.value) : undefined,
          nonce,
        });

        const l1Fee = await l2Client.estimateL1Fee({
          chain,
          account: signer,
          to: rpcTxRequest.to,
          data: rpcTxRequest.data,
          value: rpcTxRequest.value ? BigInt(rpcTxRequest.value) : undefined,
          nonce,
        });

        updateStepStatus?.(simulationKey, "l1GasEstimation", {
          loading: false,
          error: null,
          value: { l1Gas, l1Fee },
        });

        return { l1Gas, l1Fee };
      } catch (error) {
        console.error("L1 gas estimation failed:", error);
        updateStepStatus?.(simulationKey, "l1GasEstimation", {
          value: null,
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Failed to estimate l1 gas"),
        });
        throw error;
      }
    },
    enabled: nonce !== undefined && !!client,
    refetchInterval,
    retry,
  });
};
