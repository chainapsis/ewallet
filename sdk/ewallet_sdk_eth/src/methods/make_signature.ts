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
