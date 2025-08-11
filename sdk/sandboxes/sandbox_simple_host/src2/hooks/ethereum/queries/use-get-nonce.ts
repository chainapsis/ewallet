import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Address, Chain, PublicClient } from "viem";

import {
  type NonceValue,
  type SimulationStepUpdate,
} from "@keplr-ewallet-attached/store/ethereum_tx";

export interface UseGetNonceProps {
  simulationKey: string;
  signer: Address;
  chain?: Chain;
  client?: PublicClient;
  refetchInterval?: number;
  retry?: boolean;
  updateStepStatus?: (
    key: string,
    stepName: "nonce",
    status: SimulationStepUpdate<NonceValue>,
  ) => void;
}

export const useGetNonce = ({
  simulationKey,
  signer,
  chain,
  client,
  refetchInterval = 1000 * 12,
  retry = false,
  updateStepStatus,
}: UseGetNonceProps): UseQueryResult<NonceValue> => {
  return useQuery({
    queryKey: ["getNonce", simulationKey, signer, chain?.id],
    queryFn: async () => {
      if (!client) throw new Error("No public client available");

      updateStepStatus?.(simulationKey, "nonce", {
        loading: true,
        error: null,
      });

      try {
        const nonce = await client.getTransactionCount({
          address: signer,
          blockTag: "pending",
        });

        updateStepStatus?.(simulationKey, "nonce", {
          loading: false,
          error: null,
          value: nonce,
        });

        return nonce;
      } catch (error) {
        console.error("Nonce fetch failed:", error);
        updateStepStatus?.(simulationKey, "nonce", {
          value: null,
          loading: false,
          error:
            error instanceof Error ? error : new Error("Failed to fetch nonce"),
        });
        throw error;
      }
    },
    enabled: !!signer && !!client,
    refetchInterval,
    retry,
  });
};
