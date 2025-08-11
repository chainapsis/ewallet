import type { EthereumTxSignPayload } from "@keplr-ewallet/ewallet-sdk-core";
import { SUPPORTED_CHAINS } from "@keplr-ewallet/ewallet-sdk-eth";
import type { RpcTransactionRequest } from "viem";
import { createPublicClient, http } from "viem";
import { type UseQueryResult } from "@tanstack/react-query";

import type {
  NonceValue,
  FeeDataValue,
  GasEstimationValue,
  L1GasEstimationValue,
  FeeCurrencyBalanceValue,
} from "@keplr-ewallet-attached/store/ethereum_tx";
import {
  generateSimulationKey,
  useSimulationStore,
} from "@keplr-ewallet-attached/store/ethereum_tx";
import {
  useGetNonce,
  useGetFeeData,
  useGetGasEstimation,
  useGetL1GasEstimation,
  useGetFeeCurrencyBalance,
} from "./queries";

export interface EthereumTxSimulationResult {
  originalTransaction: RpcTransactionRequest;
  queries: {
    nonce: UseQueryResult<NonceValue>;
    feeData: UseQueryResult<FeeDataValue>;
    gasEstimation: UseQueryResult<GasEstimationValue>;
    l1GasEstimation: UseQueryResult<L1GasEstimationValue>;
    feeCurrencyBalance: UseQueryResult<FeeCurrencyBalanceValue>;
  };
  clearSimulation: () => void;
}

export const useEthereumTxSimulation = (
  payload: EthereumTxSignPayload,
): EthereumTxSimulationResult => {
  const updateStepStatus = useSimulationStore(
    (state) => state.updateStepStatus,
  );
  const clearSimulation = useSimulationStore((state) => state.clearSimulation);

  const signer = payload.signer as `0x${string}`;
  const rpcTxRequest = payload.data.transaction;
  const simulationKey = generateSimulationKey({
    requestId: payload.request_id,
    transaction: rpcTxRequest,
    chainId: payload.chain_info.chain_id,
    signer,
  });
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

  const nonceQuery = useGetNonce({
    simulationKey,
    signer,
    chain: currentChain,
    client: publicClient as any,
    updateStepStatus,
  });

  const feeDataQuery = useGetFeeData({
    simulationKey,
    chain: currentChain,
    client: publicClient as any,
    updateStepStatus,
  });

  const gasEstimationQuery = useGetGasEstimation({
    simulationKey,
    signer,
    rpcTxRequest,
    nonce: nonceQuery.data,
    client: publicClient as any,
    updateStepStatus,
    hostOrigin: payload.origin,
  });

  const l1GasEstimationQuery = useGetL1GasEstimation({
    simulationKey,
    signer,
    rpcTxRequest,
    chain: currentChain,
    nonce: nonceQuery.data,
    client: publicClient as any,
    updateStepStatus,
  });

  const feeCurrencyBalanceQuery = useGetFeeCurrencyBalance({
    simulationKey,
    signer,
    chain: currentChain,
    client: publicClient as any,
    updateStepStatus,
  });

  return {
    originalTransaction: rpcTxRequest,
    queries: {
      nonce: nonceQuery,
      feeData: feeDataQuery,
      gasEstimation: gasEstimationQuery,
      l1GasEstimation: l1GasEstimationQuery,
      feeCurrencyBalance: feeCurrencyBalanceQuery,
    },
    clearSimulation: () => {
      clearSimulation(simulationKey);
    },
  };
};
