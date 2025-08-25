import type {
  ChainInfoForAttachedModal,
  EWalletMsgShowModal,
  MakeEthereumSigData,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Chain } from "viem";
import { v4 as uuidv4 } from "uuid";

import type {
  EthEWalletInterface,
  EthSignParams,
  EthSignResult,
} from "@keplr-ewallet-sdk-eth/types";
import {
  getChainIconUrl,
  SUPPORTED_CHAINS,
  TESTNET_CHAINS,
} from "@keplr-ewallet-sdk-eth/chains";

async function handleSigningFlow(
  ethEWallet: EthEWalletInterface,
  data: MakeEthereumSigData,
): Promise<EthSignResult> {
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
    if (!modalResult.approved) {
      throw new Error(
        modalResult.reason ?? "User rejected the signature request",
      );
    }

    const makeEthereumSigResult = modalResult.data;

    if (!makeEthereumSigResult || makeEthereumSigResult.chain_type !== "eth") {
      throw new Error("Invalid chain type for eth signature");
    }

    return makeEthereumSigResult.data;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

    throw new Error(error instanceof Error ? error.message : String(error));
  } finally {
    await eWallet.hideModal();
  }
}

export async function makeSignature(
  this: EthEWalletInterface,
  params: EthSignParams,
): Promise<EthSignResult> {
  const origin = this.eWallet.origin;

  const provider = this.getEthereumProvider();
  const chainId = provider.chainId;
  const chainIdNumber = parseInt(chainId, 16);

  let chains: Chain[] = SUPPORTED_CHAINS;
  if (this.useTestnet) {
    chains = [...chains, ...TESTNET_CHAINS];
  }

  // CHECK: custom chains added to the provider can be used later
  const activeChain = chains.find((chain) => chain.id === chainIdNumber);
  if (!activeChain) {
    throw new Error("Chain not found in the supported chains");
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
    signer: params.data.address,
    request_id: uuidv4(),
  };

  const makeSignatureData = createMakeSignatureData(basePayload, params);

  const signResult = await handleSigningFlow(this, makeSignatureData);

  return signResult;
}

function createMakeSignatureData(
  basePayload: {
    chain_info: ChainInfoForAttachedModal;
    origin: string;
    signer: string;
    request_id: string;
  },
  params: EthSignParams,
): MakeEthereumSigData {
  switch (params.type) {
    case "sign_transaction": {
      return {
        chain_type: "eth",
        sign_type: "tx",
        payload: {
          ...basePayload,
          data: {
            transaction: params.data.transaction,
          },
        },
      };
    }

    case "personal_sign": {
      return {
        chain_type: "eth",
        sign_type: "arbitrary",
        payload: {
          ...basePayload,
          data: {
            message: params.data.message,
          },
        },
      };
    }

    case "sign_typedData_v4": {
      return {
        chain_type: "eth",
        sign_type: "eip712",
        payload: {
          ...basePayload,
          data: {
            version: "4",
            serialized_typed_data: params.data.serializedTypedData,
          },
        },
      };
    }

    default: {
      throw new Error(`Unknown sign method: ${(params as any).type}`);
    }
  }
}

// const processedData = processModalResult(data, modalResult.data, params);
// // if (config.processModalResult) {
// //   processedData = config.processModalResult(data, modalResult.data);
// // }

// const msgHash = hashMakeSignatureData(processedData, params);

// const makeSignatureMsg: EWalletMsgMakeSignature = {
//   target: "keplr_ewallet_attached",
//   msg_type: "make_signature",
//   payload: {
//     msg: msgHash,
//   },
// };

// const signOutput = await eWallet.makeSignature(makeSignatureMsg);

// return processMakeSignatureResult(signOutput, processedData);

// TODO: move to attached
// function processModalResult(
//   data: MakeEthereumSigData,
//   modalResult: MakeSignatureModalResult | null,
//   params: EthSignParams,
// ): MakeEthereumSigData {
//   switch (params.type) {
//     case "sign_transaction": {
//       if (data.sign_type !== "tx") {
//         throw new Error("Sign type should be tx");
//       }

//       if (!modalResult) {
//         throw new Error(
//           "Make signature result is not present for sign_transaction method",
//         );
//       }

//       if (modalResult.chain_type !== "eth") {
//         throw new Error("Invalid chain type for eth signature");
//       }

//       const originalTx = data.payload.data.transaction;
//       const simulatedTx = modalResult.data.transaction;

//       const immutableFields = ["type", "to", "value", "data"] as const;

//       for (const field of immutableFields) {
//         if (originalTx[field] !== simulatedTx[field]) {
//           throw new Error(
//             `Simulation changed immutable field: ${field}. Original: ${originalTx[field]}, Simulated: ${simulatedTx[field]}`,
//           );
//         }
//       }

//       return {
//         ...data,
//         payload: {
//           ...data.payload,
//           data: {
//             transaction: simulatedTx,
//           },
//         },
//       };
//     }

//     case "personal_sign": {
//       return data;
//     }

//     case "sign_typedData_v4": {
//       return data;
//     }

//     default: {
//       throw new Error("unreachable");
//     }
//   }
// }

// function hashMakeSignatureData(
//   data: MakeEthereumSigData,
//   params: EthSignParams,
// ) {
//   switch (params.type) {
//     case "sign_transaction": {
//       if (data.sign_type !== "tx") {
//         throw new Error("Sign type should be tx");
//       }

//       const payload = data.payload;

//       const serializableTx = toTransactionSerializable({
//         chainId: payload.chain_info.chain_id,
//         tx: payload.data.transaction,
//       });

//       return hashEthereumTransaction(serializableTx);
//     }
//     case "personal_sign": {
//       if (data.sign_type !== "arbitrary") {
//         throw new Error("Sign type should be arbitrary");
//       }

//       return hashEthereumMessage(data.payload.data.message);
//     }
//     case "sign_typedData_v4": {
//       if (data.sign_type !== "eip712") {
//         throw new Error("Sign type should be eip712");
//       }

//       const payloadData = data.payload.data;

//       if (payloadData.version !== "4") {
//         throw new Error(
//           "Typed data version should be 4 for sign_typedData_v4 method",
//         );
//       }

//       const typedData = parseTypedDataDefinition(
//         payloadData.serialized_typed_data,
//       );

//       return hashEthereumTypedData(typedData);
//     }
//     default: {
//       throw new Error("unreachable");
//     }
//   }
// }

// function processMakeSignatureResult(
//   signOutput: SignOutput,
//   data: MakeEthereumSigData,
// ): EthSignResult {
//   switch (data.sign_type) {
//     case "tx": {
//       if (!data) {
//         throw new Error("Data is required for sign_transaction method");
//       }

//       if (data.sign_type !== "tx") {
//         throw new Error("Sign type should be tx");
//       }

//       const signature = encodeEthereumSignature(signOutput);

//       const payload = data.payload;

//       const serializableTx = toTransactionSerializable({
//         chainId: payload.chain_info.chain_id,
//         tx: payload.data.transaction,
//       });

//       const signedTransaction = serializeTransaction(serializableTx, signature);

//       return {
//         type: "signed_transaction",
//         signedTransaction,
//       };
//     }
//     case "arbitrary":
//     case "eip712": {
//       const signature = encodeEthereumSignature(signOutput);
//       return {
//         type: "signature",
//         signature: serializeSignature(signature),
//       };
//     }
//     default: {
//       throw new Error("unreachable");
//     }
//   }
// }
