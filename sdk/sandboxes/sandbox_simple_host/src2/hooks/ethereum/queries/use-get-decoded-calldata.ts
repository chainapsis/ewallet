import type { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";

import { decodeCalldata } from "@keplr-ewallet-attached/hooks/ethereum/decoder";

export interface UseDecodedCalldataProps {
  calldata?: Hex;
  retry?: boolean;
}

export const useDecodedCalldata = ({
  calldata,
  retry = false,
}: UseDecodedCalldataProps) => {
  return useQuery({
    queryKey: ["get-decoded-ethereum-tx-calldata", calldata],
    queryFn: async () => {
      if (!calldata) return null;
      return await decodeCalldata({ calldata });
    },
    enabled: !!calldata,
    retry,
  });
};
