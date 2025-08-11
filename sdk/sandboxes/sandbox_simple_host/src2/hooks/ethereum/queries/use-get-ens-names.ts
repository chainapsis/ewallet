import {
  type Address,
  createPublicClient,
  http,
  isAddress,
  isAddressEqual,
  zeroAddress,
} from "viem";
import { mainnet } from "viem/chains";
import { useQuery } from "@tanstack/react-query";

export interface UseGetEnsNamesProps {
  to?: Address;
  args?: readonly unknown[];
  retry?: boolean;
}

export const useGetEnsNames = ({
  to,
  args,
  retry = false,
}: UseGetEnsNamesProps) => {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const addresses = (() => {
    const candidates: Address[] = [];
    if (to && !isAddressEqual(to, zeroAddress)) candidates.push(to);
    if (args && Array.isArray(args)) {
      for (const arg of args) {
        if (
          typeof arg === "string" &&
          arg.startsWith("0x") &&
          isAddress(arg) &&
          !isAddressEqual(arg, zeroAddress)
        ) {
          candidates.push(arg);
        }
      }
    }

    return candidates;
  })();

  return useQuery({
    queryKey: ["get-ens-names", addresses],
    queryFn: async () => {
      if (!client || addresses.length === 0) return {};
      const ensMapping: Record<string, string | null> = {};
      await Promise.all(
        addresses.map(async (address) => {
          try {
            ensMapping[address] = await client.getEnsName({ address });
          } catch {
            ensMapping[address] = null;
          }
        }),
      );
      return ensMapping;
    },
    enabled: !!client && addresses.length > 0,
    retry,
  });
};
