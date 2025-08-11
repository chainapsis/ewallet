import type {
  EthereumTxSignPayload,
  MakeSignatureModalPayload,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { RpcTransactionRequest } from "viem";

import {
  generateSimulationKey,
  useSimulationStore,
  defaultSteps,
} from "@keplr-ewallet-attached/store/ethereum_tx";
import { isMakeSignatureModalPayload } from "@keplr-ewallet-attached/utils/make_signature";
import { getHostOriginFromPayload } from "@keplr-ewallet-attached/utils/origin";

export interface EthereumTxSimulationStatus {
  isSimulating: boolean;
  hasErrors: boolean;
  errors: Record<string, Error | null>;
  hasAttempted: boolean;
  isFeeSufficient: boolean;
  getSimulatedTransaction: (
    originalTransaction: RpcTransactionRequest,
  ) => RpcTransactionRequest | null;
}

export const useEthereumTxSimulationStatus = (
  payload: MakeSignatureModalPayload | EthereumTxSignPayload,
): EthereumTxSimulationStatus => {
  const hostOrigin = getHostOriginFromPayload(payload);

  const isDemo =
    !!hostOrigin && hostOrigin === import.meta.env.VITE_DEMO_WEB_ORIGIN;

  const simulationKey = (() => {
    if (isMakeSignatureModalPayload(payload)) {
      if (
        payload.data.chain_type !== "eth" ||
        payload.data.sign_type !== "tx"
      ) {
        return null;
      }

      const makeSignaturePayload = payload.data.payload;
      return generateSimulationKey({
        requestId: makeSignaturePayload.request_id,
        transaction: makeSignaturePayload.data.transaction,
        chainId: makeSignaturePayload.chain_info.chain_id,
        signer: makeSignaturePayload.signer,
      });
    } else {
      return generateSimulationKey({
        requestId: payload.request_id,
        transaction: payload.data.transaction,
        chainId: payload.chain_info.chain_id,
        signer: payload.signer,
      });
    }
  })();

  if (!simulationKey) {
    return {
      isSimulating: false,
      hasErrors: false,
      errors: {},
      hasAttempted: true,
      isFeeSufficient: true,
      getSimulatedTransaction: () => null,
    };
  }

  const simulationSteps = useSimulationStore(
    (state) => state.simulations.get(simulationKey) || defaultSteps,
  );

  const getSimulatedTransaction = useSimulationStore(
    (state) => state.getSimulatedTransaction,
  );

  const isSimulating = Object.values(simulationSteps).some(
    (step) => step.loading,
  );
  const errors = Object.fromEntries(
    Object.entries(simulationSteps)
      .filter(([_, step]) => step.error)
      .map(([key, step]) => [key, step.error]),
  );
  const hasErrors = Object.values(errors).some((error) => error !== null);
  const allStepsAttempted = Object.values(simulationSteps).every(
    (step) => step.attempted,
  );

  const isFeeSufficient = (() => {
    if (isDemo) {
      return true;
    }

    const { gasEstimation, feeData, l1GasEstimation, feeCurrencyBalance } =
      simulationSteps;

    if (!gasEstimation.value || !feeData.value || !feeCurrencyBalance.value) {
      return false;
    }

    let total: bigint;

    // NOTE: as of now, we only support native currency as fee currency
    // more complex fee calculation will be supported in the future
    if (feeData.value.type === "eip1559") {
      total = gasEstimation.value * feeData.value.maxFeePerGas!;
    } else {
      total = gasEstimation.value * feeData.value.gasPrice!;
    }

    if (l1GasEstimation.value) {
      total += l1GasEstimation.value.l1Fee;
    }

    return feeCurrencyBalance.value.amount >= total;
  })();

  return {
    isSimulating,
    hasErrors,
    errors,
    hasAttempted: allStepsAttempted,
    isFeeSufficient,
    getSimulatedTransaction: (originalTransaction: RpcTransactionRequest) => {
      return getSimulatedTransaction(simulationKey, originalTransaction);
    },
  };
};
