import type { Address, PublicClient } from "viem";
import { useQuery } from "@tanstack/react-query";

import { COMMON_READ_FUNCTIONS_ABI } from "@keplr-ewallet-attached/hooks/ethereum/decoder";

export interface UseGetTokenMetadataProps {
  to?: Address;
  standard?: { isERC20: boolean; isERC721: boolean; isERC1155: boolean };
  client?: PublicClient;
  retry?: boolean;
}

export const useGetTokenMetadata = ({
  to,
  standard,
  client,
  retry = false,
}: UseGetTokenMetadataProps) => {
  return useQuery({
    queryKey: ["get-token-metadata", to, standard],
    queryFn: async () => {
      if (!to || !client || !standard) {
        return { name: null, symbol: null, decimals: null };
      }
      const defaultResult = { name: null, symbol: null, decimals: null };
      try {
        const [name, symbol, decimals] = await Promise.all([
          client
            .readContract({
              address: to,
              abi: COMMON_READ_FUNCTIONS_ABI,
              functionName: "name",
            })
            .catch(() => null),
          client
            .readContract({
              address: to,
              abi: COMMON_READ_FUNCTIONS_ABI,
              functionName: "symbol",
            })
            .catch(() => null),
          standard.isERC20
            ? client
                .readContract({
                  address: to,
                  abi: COMMON_READ_FUNCTIONS_ABI,
                  functionName: "decimals",
                })
                .catch(() => null)
            : Promise.resolve(null),
        ]);
        return { name, symbol, decimals };
      } catch {
        return defaultResult;
      }
    },
    enabled: !!to && !!client && !!standard,
    retry,
  });
};
