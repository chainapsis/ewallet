import type { KeplrEWalletInterface } from "@keplr-ewallet/ewallet-sdk-core";

import type { EthEWalletInterface } from "./types";
import { init, initAsync } from "./static/init";
import { lazyInit } from "./private/lazy_init";
import { getEthereumProvider } from "./methods/get_ethereum_provider";
import { personalSign } from "./methods/personal_sign";
import { switchChain } from "./methods/switch_chain";
import { toViemAccount } from "./methods/to_viem_account";
import { getPublicKey } from "./methods/get_public_key";
import { getAddress } from "./methods/get_address";
import { makeSignature } from "./methods/make_signature";

const USE_TESTNET_DEFAULT = false;

export function EthEWallet(
  this: EthEWalletInterface,
  eWallet: KeplrEWalletInterface,
  useTestnet?: boolean,
) {
  this.eWallet = eWallet;
  this.useTestnet = useTestnet !== undefined ? useTestnet : USE_TESTNET_DEFAULT;
  this.provider = null;
  this.state = {
    publicKey: null,
    publicKeyRaw: null,
    address: null,
  };
  this.waitUntilInitialized = lazyInit(this).then();
}

EthEWallet.init = init;
EthEWallet.initAsync = initAsync;

const ptype: EthEWalletInterface = EthEWallet.prototype;

ptype.getEthereumProvider = getEthereumProvider;
ptype.sign = personalSign;
ptype.switchChain = switchChain;
ptype.toViemAccount = toViemAccount;
ptype.getPublicKey = getPublicKey;
ptype.getAddress = getAddress;
ptype.makeSignature = makeSignature;
