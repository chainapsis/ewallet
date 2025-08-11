import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Chain, PublicClient } from "viem";

import type {
  FeeDataValue,
  SimulationStepUpdate,
} from "@keplr-ewallet-attached/store/ethereum_tx";

export interface UseGetFeeDataProps {
  simulationKey: string;
  chain?: Chain;
  client?: PublicClient;
  refetchInterval?: number;
  retry?: boolean;
  updateStepStatus?: (
    key: string,
    stepName: "feeData",
    status: SimulationStepUpdate<FeeDataValue>,
  ) => void;
}

export const useGetFeeData = ({
  simulationKey,
  chain,
  client,
  refetchInterval = 1000 * 12,
  retry = false,
  updateStepStatus,
}: UseGetFeeDataProps): UseQueryResult<FeeDataValue> => {
  return useQuery({
    queryKey: ["getFeeData", simulationKey, chain?.id],
    queryFn: async () => {
      if (!client) throw new Error("No public client available");

      updateStepStatus?.(simulationKey, "feeData", {
        loading: true,
        error: null,
      });

      try {
        const feeHistory = await client.getFeeHistory({
          blockCount: 1,
          rewardPercentiles: [50],
        });

        const baseFeePerGas = feeHistory.baseFeePerGas[0];

        if (baseFeePerGas) {
          const maxPriorityFeePerGas = feeHistory.reward![0][0] ?? BigInt(0);
          const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;

          updateStepStatus?.(simulationKey, "feeData", {
            loading: false,
            error: null,
            value: {
              type: "eip1559" as const,
              maxFeePerGas,
              maxPriorityFeePerGas,
              baseFeePerGas,
            },
          });

          return {
            type: "eip1559" as const,
            maxFeePerGas,
            maxPriorityFeePerGas,
            baseFeePerGas,
          };
        } else {
          const gasPrice = await client.getGasPrice();

          updateStepStatus?.(simulationKey, "feeData", {
            loading: false,
            error: null,
            value: {
              type: "legacy" as const,
              gasPrice,
            },
          });
          return {
            type: "legacy" as const,
            gasPrice,
          };
        }
      } catch (error) {
        console.error("Fee data fetch failed:", error);
        updateStepStatus?.(simulationKey, "feeData", {
          value: null,
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Failed to fetch fee data"),
        });
        throw error;
      }
    },
    enabled: !!client,
    refetchInterval,
    retry,
  });
};
