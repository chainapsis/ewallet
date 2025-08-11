import {
  type Address,
  createPublicClient,
  formatEther,
  formatUnits,
  hexToBigInt,
  http,
  isAddressEqual,
  zeroAddress,
} from "viem";
import type { EthereumTxSignPayload } from "@keplr-ewallet/ewallet-sdk-core";
import { SUPPORTED_CHAINS } from "@keplr-ewallet/ewallet-sdk-eth";

import {
  useDecodedCalldata,
  useCheckStandard,
  useGetTokenMetadata,
  useGetEnsNames,
} from "./queries";
import { templates, validateArgsForFunction, renderTemplate } from "./decoder";

export const useEthereumHumanReadableTx = (payload: EthereumTxSignPayload) => {
  const rpcTxRequest = payload.data.transaction;

  const currentChain = SUPPORTED_CHAINS.find(
    (chain) =>
      chain.id === Number(payload.chain_info.chain_id.replace("eip155:", "")),
  );

  const publicClient = (() => {
    if (!currentChain) {
      return null;
    }

    return createPublicClient({
      chain: currentChain,
      transport: http(),
    });
  })();

  const decodedCalldataQuery = useDecodedCalldata({
    calldata: rpcTxRequest.data,
  });

  const checkStandardQuery = useCheckStandard({
    to: rpcTxRequest.to ? rpcTxRequest.to : undefined,
    calldata: rpcTxRequest.data,
    client: publicClient as any,
  });

  const tokenMetadataQuery = useGetTokenMetadata({
    to: rpcTxRequest.to ? rpcTxRequest.to : undefined,
    standard: checkStandardQuery.data,
    client: publicClient as any,
  });

  const ensNamesQuery = useGetEnsNames({
    to: rpcTxRequest.to ? rpcTxRequest.to : undefined,
    args: decodedCalldataQuery.data?.args,
  });

  const description = (() => {
    const decoded = decodedCalldataQuery.data;
    const standard = checkStandardQuery.data;
    const tokenMetadata = tokenMetadataQuery.data;
    const ensNames = ensNamesQuery.data || {};

    const formatAddress = (addr: Address) =>
      ensNames[addr] ?? `${addr.slice(0, 4)}...${addr.slice(addr.length - 4)}`;

    if (!decoded || !standard) {
      if (rpcTxRequest.to) {
        if (isAddressEqual(rpcTxRequest.to, zeroAddress)) {
          // CHECK: call to zero address means deploy a contract (not for some chains... like ZkSync)
          return "Deploy a contract";
        }

        if (rpcTxRequest.value) {
          const amt = hexToBigInt(rpcTxRequest.value);
          const sym = currentChain?.nativeCurrency.symbol ?? "ETH";
          return `Send ${formatEther(amt)} ${sym} to ${formatAddress(
            rpcTxRequest.to,
          )}`;
        }
      }
      return null;
    }

    const fn = decoded.functionName;
    const args: unknown[] = Array.isArray(decoded?.args) ? decoded.args : [];
    const stdKey = standard.isERC20
      ? "ERC20"
      : standard.isERC721
        ? "ERC721"
        : standard.isERC1155
          ? "ERC1155"
          : undefined;

    if (!validateArgsForFunction(fn, args)) {
      return fn ? `Execute function ${fn}` : "Unknown transaction";
    }

    const cfg = templates.find(
      (t) =>
        t.functionName === fn &&
        t.standard === stdKey &&
        t.argCount === args.length,
    );
    if (!cfg) {
      return fn ? `Execute function ${fn}` : "Unknown transaction";
    }

    const vars: Record<string, string> = {};
    for (const [name, idx] of Object.entries(cfg.argMap)) {
      const raw = args[idx];
      if (["from", "to", "operator", "spender"].includes(name)) {
        vars[name] = formatAddress(raw as Address);
      } else {
        vars[name] = typeof raw === "bigint" ? raw.toString() : String(raw);
      }
    }
    if (cfg.extraVars) {
      Object.assign(vars, cfg.extraVars(args));
    }

    if (stdKey === "ERC20" && tokenMetadata) {
      if (vars.amount && tokenMetadata.decimals != null) {
        vars.amount = formatUnits(BigInt(vars.amount), tokenMetadata.decimals);
      }
      vars.symbol = tokenMetadata.symbol ?? "token";
    }

    return renderTemplate(cfg.template, vars);
  })();

  const isLoading =
    decodedCalldataQuery.isLoading ||
    checkStandardQuery.isLoading ||
    tokenMetadataQuery.isLoading ||
    ensNamesQuery.isLoading;

  const errors = [
    decodedCalldataQuery.error,
    checkStandardQuery.error,
    tokenMetadataQuery.error,
    ensNamesQuery.error,
  ].filter((error) => error !== null);

  return {
    description,
    isLoading,
    errors,
  };
};
