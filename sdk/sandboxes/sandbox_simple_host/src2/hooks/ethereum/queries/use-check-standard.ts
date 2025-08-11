import { useQuery } from "@tanstack/react-query";
import { isAddressEqual, zeroAddress } from "viem";
import type { PublicClient, Hex, Address } from "viem";

import { checkSupportStandard } from "@keplr-ewallet-attached/hooks/ethereum/decoder";

export interface UseCheckStandardProps {
  to?: Address;
  calldata?: Hex;
  client?: PublicClient;
  retry?: boolean;
}

export const useCheckStandard = ({
  to,
  calldata,
  client,
  retry = false,
}: UseCheckStandardProps) => {
  return useQuery({
    queryKey: ["check-standard-support", to, calldata],
    queryFn: async () => {
      if (!to || !client || isAddressEqual(to, zeroAddress)) {
        return { isERC20: false, isERC721: false, isERC1155: false };
      }
      return await checkSupportStandard(client, to, calldata);
    },
    enabled: !!to && !!client,
    retry,
  });
};
