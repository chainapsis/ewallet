import type {
  ChainInfoForAttachedModal,
  EWalletMsgMakeSignature,
  EWalletMsgShowModal,
  MakeEthereumSigData,
  MakeEthereumSignType,
  MakeSignatureModalResult,
  SignOutput,
} from "@keplr-ewallet/ewallet-sdk-core";
import { serializeSignature, serializeTransaction, type Chain } from "viem";
import { v4 as uuidv4 } from "uuid";

import type {
  EthSignMethod,
  EthSignMethodMap,
  EthSignParams,
  EthSignResult,
  EthSignFunction,
  EthEWalletInterface,
} from "@keplr-ewallet-sdk-eth/types";
import {
  hashEthereumMessage,
  hashEthereumTransaction,
  hashEthereumTypedData,
  encodeEthereumSignature,
  toTransactionSerializable,
  parseTypedDataDefinition,
} from "@keplr-ewallet-sdk-eth/utils";
import type { EthEWallet } from "@keplr-ewallet-sdk-eth/eth_ewallet";
import {
  getChainIconUrl,
  SUPPORTED_CHAINS,
  TESTNET_CHAINS,
} from "@keplr-ewallet-sdk-eth/chains";
import { standardError } from "@keplr-ewallet-sdk-eth/errors";

/**
 * Internal type for the sign type configuration
 * @param M - Sign method
 * @returns Sign type configuration
 */
type SignTypeConfig<M extends EthSignMethod> = {
  sign_type: MakeEthereumSignType;
  processModalResult?: (
    data: MakeEthereumSigData,
    modalResult: MakeSignatureModalResult | null,
  ) => MakeEthereumSigData;
  hashMakeSignatureData: (data: MakeEthereumSigData) => Uint8Array;
  processMakeSignatureResult: (
    signOutput: SignOutput,
    data?: MakeEthereumSigData,
  ) => EthSignMethodMap[M]["result"];
};

const signTypeConfig: Record<EthSignMethod, SignTypeConfig<EthSignMethod>> = {
  sign_transaction: {
    sign_type: "tx",
    processModalResult: (data, modalResult) => {
      if (data.sign_type !== "tx") {
        throw standardError.ethEWallet.invalidSignType({
          message: "Sign type should be tx",
        });
      }

      if (!modalResult) {
        throw standardError.ethEWallet.invalidMessage({
          message:
            "Make signature result is not present for sign_transaction method",
        });
      }

      if (modalResult.modal_type !== "make_signature") {
        throw standardError.ethEWallet.invalidMessage({
          message: "Invalid modal result for eth signature",
        });
      }

      if (modalResult.chain_type !== "eth") {
        throw standardError.ethEWallet.invalidMessage({
          message: "Invalid chain type for eth signature",
        });
      }

      const originalTx = data.payload.data.transaction;
      const simulatedTx = modalResult.data.transaction;

      const immutableFields = ["type", "to", "value", "data"] as const;

      for (const field of immutableFields) {
        if (originalTx[field] !== simulatedTx[field]) {
          throw standardError.ethEWallet.invalidMessage({
            message: `Simulation changed immutable field: ${field}. Original: ${originalTx[field]}, Simulated: ${simulatedTx[field]}`,
          });
        }
      }

      return {
        ...data,
        payload: {
          ...data.payload,
          data: {
            transaction: simulatedTx,
          },
        },
      };
    },
    hashMakeSignatureData: (data) => {
      if (data.sign_type !== "tx") {
        throw standardError.ethEWallet.invalidSignType({
          message: "Sign type should be tx",
        });
      }

      const payload = data.payload;

      const serializableTx = toTransactionSerializable({
        chainId: payload.chain_info.chain_id,
        tx: payload.data.transaction,
      });

      return hashEthereumTransaction(serializableTx);
    },
    processMakeSignatureResult: (signOutput, data) => {
      if (!data) {
        throw standardError.ethEWallet.invalidMessage({
          message: "Data is required for sign_transaction method",
        });
      }

      if (data.sign_type !== "tx") {
        throw standardError.ethEWallet.invalidSignType({
          message: "Sign type should be tx",
        });
      }

      const signature = encodeEthereumSignature(signOutput);

      const payload = data.payload;

      const serializableTx = toTransactionSerializable({
        chainId: payload.chain_info.chain_id,
        tx: payload.data.transaction,
      });

      const signedTransaction = serializeTransaction(serializableTx, signature);

      return {
        type: "signed_transaction",
        signedTransaction,
      };
    },
  },
  personal_sign: {
    sign_type: "arbitrary",
    hashMakeSignatureData: (data) => {
      if (data.sign_type !== "arbitrary") {
        throw standardError.ethEWallet.invalidSignType({
          message: "Sign type should be arbitrary",
        });
      }

      return hashEthereumMessage(data.payload.data.message);
    },
    processMakeSignatureResult: (signOutput) => {
      const signature = encodeEthereumSignature(signOutput);
      return {
        type: "signature",
        signature: serializeSignature(signature),
      };
    },
  },
  sign_typedData_v4: {
    sign_type: "eip712",
    hashMakeSignatureData: (data) => {
      if (data.sign_type !== "eip712") {
        throw standardError.ethEWallet.invalidSignType({
          message: "Sign type should be eip712",
        });
      }

      const payloadData = data.payload.data;

      if (payloadData.version !== "4") {
        throw standardError.ethEWallet.invalidMessage({
          message:
            "Typed data version should be 4 for sign_typedData_v4 method",
        });
      }

      const typedData = parseTypedDataDefinition(
        payloadData.serialized_typed_data,
      );

      return hashEthereumTypedData(typedData);
    },
    processMakeSignatureResult: (signOutput) => {
      const signature = encodeEthereumSignature(signOutput);
      return {
        type: "signature",
        signature: serializeSignature(signature),
      };
    },
  },
};

async function handleSigningFlow(
  ethEWallet: EthEWalletInterface,
  config: SignTypeConfig<EthSignMethod>,
  data: MakeEthereumSigData,
): Promise<EthSignMethodMap[EthSignMethod]["result"]> {
  const showModalMsg: EWalletMsgShowModal = {
    target: "keplr_ewallet_attached",
    msg_type: "show_modal",
    payload: {
      modal_type: "make_signature",
      data,
    },
  };

  const eWallet = ethEWallet.eWallet;

  try {
    const modalResult = await eWallet.showModal(showModalMsg);

    await eWallet.hideModal();

    if (!modalResult.approved) {
      throw standardError.ethEWallet.userRejectedRequest({
        message: modalResult.reason ?? "User rejected the signature request",
      });
    }

    let processedData = data;
    if (config.processModalResult) {
      processedData = config.processModalResult(data, modalResult.data);
    }

    const msgHash = config.hashMakeSignatureData(processedData);

    const makeSignatureMsg: EWalletMsgMakeSignature = {
      target: "keplr_ewallet_attached",
      msg_type: "make_signature",
      payload: {
        msg: msgHash,
      },
    };

    const signOutput = await eWallet.makeSignature(makeSignatureMsg);

    return config.processMakeSignatureResult(signOutput, processedData);
  } catch (error) {
    // make sure to hide modal even if error thrown from modal
    await eWallet.hideModal();

    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

    throw standardError.ethEWallet.signatureFailed({
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function _makeSignature<P extends EthSignParams>(
  this: EthEWalletInterface,
  parameters: P,
): Promise<EthSignResult<P>> {
  const origin = this.eWallet.origin;

  const provider = await this.getEthereumProvider();
  const chainId = provider.chainId;
  const chainIdNumber = parseInt(chainId, 16);

  let chains: Chain[] = SUPPORTED_CHAINS;
  if (this.useTestnet) {
    chains = [...chains, ...TESTNET_CHAINS];
  }

  // CHECK: custom chains added to the provider can be used later
  const activeChain = chains.find((chain) => chain.id === chainIdNumber);
  if (!activeChain) {
    throw standardError.ethEWallet.invalidMessage({
      message: "Chain not found in the supported chains",
    });
  }

  const chainInfo: ChainInfoForAttachedModal = {
    chain_id: `eip155:${activeChain.id}`,
    chain_name: activeChain.name,
    chain_symbol_image_url: getChainIconUrl(activeChain.id),
    rpc_url: activeChain.rpcUrls.default.http[0],
    block_explorer_url: activeChain.blockExplorers?.default.url,
  };

  const basePayload = {
    chain_info: chainInfo,
    origin,
    signer: parameters.data.address,
    request_id: uuidv4(),
  };

  let signType: MakeEthereumSignType;
  let makeSignatureData: MakeEthereumSigData;

  switch (parameters.type) {
    case "sign_transaction": {
      signType = "tx";
      makeSignatureData = {
        chain_type: "eth",
        sign_type: signType,
        payload: {
          ...basePayload,
          data: {
            transaction: parameters.data.transaction,
          },
        },
      };
      break;
    }

    case "personal_sign": {
      signType = "arbitrary";
      makeSignatureData = {
        chain_type: "eth",
        sign_type: signType,
        payload: {
          ...basePayload,
          data: {
            message: parameters.data.message,
          },
        },
      };
      break;
    }

    case "sign_typedData_v4": {
      signType = "eip712";
      makeSignatureData = {
        chain_type: "eth",
        sign_type: signType,
        payload: {
          ...basePayload,
          data: {
            version: "4",
            serialized_typed_data: parameters.data.serializedTypedData,
          },
        },
      };
      break;
    }

    default: {
      throw standardError.ethEWallet.invalidMessage({
        message: `Unknown sign method: ${(parameters as any).type}`,
      });
    }
  }

  return await handleSigningFlow(
    this,
    signTypeConfig[parameters.type],
    makeSignatureData,
  );
}

export const makeSignature: EthSignFunction = _makeSignature;
