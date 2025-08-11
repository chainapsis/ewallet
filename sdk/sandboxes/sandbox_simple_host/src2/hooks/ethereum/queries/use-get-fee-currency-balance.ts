import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Address, Chain, PublicClient } from "viem";

import type {
  FeeCurrencyBalanceValue,
  SimulationStepUpdate,
} from "@keplr-ewallet-attached/store/ethereum_tx";

export interface UseGetFeeCurrencyBalanceProps {
  simulationKey: string;
  signer: Address;
  chain?: Chain;
  client?: PublicClient;
  refetchInterval?: number;
  retry?: boolean;
  updateStepStatus?: (
    key: string,
    stepName: "feeCurrencyBalance",
    status: SimulationStepUpdate<FeeCurrencyBalanceValue>,
  ) => void;
}

export const useGetFeeCurrencyBalance = ({
  simulationKey,
  signer,
  chain,
  client,
  refetchInterval = 1000 * 12,
  retry = false,
  updateStepStatus,
}: UseGetFeeCurrencyBalanceProps): UseQueryResult<FeeCurrencyBalanceValue> => {
  return useQuery({
    queryKey: ["getFeeCurrencyBalance", simulationKey, signer, chain?.id],
    queryFn: async () => {
      if (!chain || !client) throw new Error("No public client available");

      updateStepStatus?.(simulationKey, "feeCurrencyBalance", {
        loading: true,
        error: null,
      });

      // NOTE: as of now, we only support native currency as fee currency
      const nativeCurrency = chain?.nativeCurrency;

      if (!nativeCurrency)
        throw new Error("No native currency found for the chain");

      try {
        const balance = await client.getBalance({
          address: signer,
        });

        const feeCurrencyBalance: FeeCurrencyBalanceValue = {
          amount: balance,
          nativeCurrency,
          feeCurrency: nativeCurrency,
        };

        updateStepStatus?.(simulationKey, "feeCurrencyBalance", {
          loading: false,
          error: null,
          value: feeCurrencyBalance,
        });

        return feeCurrencyBalance;
      } catch (error) {
        console.error("Native balance fetch failed:", error);
        updateStepStatus?.(simulationKey, "feeCurrencyBalance", {
          value: null,
          loading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Failed to fetch native balance"),
        });
        throw error;
      }
    },
    enabled: !!client,
    refetchInterval,
    retry,
  });
};
