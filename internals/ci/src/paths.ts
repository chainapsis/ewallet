import path from "node:path";

export const paths = (function() {
  const root = path.join(__dirname, "../../../");

  const ksn_interface = path.join(
    __dirname,
    "../../../key_share_node/ksn_interface/",
  );

  const ksn_server = path.join(__dirname, "../../../key_share_node/server");

  const ksn_pg_interface = path.join(
    __dirname,
    "../../../key_share_node/pg_interface/",
  );

  const dotenv = path.join(__dirname, "../../../lib/dotenv");

  const stdlib = path.join(__dirname, "../../../lib/stdlib_js");

  const sdk_common = path.join(__dirname, "../../../sdk/ewallet_sdk_common/");

  const sdk_core = path.join(__dirname, "../../../sdk/ewallet_sdk_core/");

  const sdk_eth = path.join(__dirname, "../../../sdk/ewallet_sdk_eth/");

  const sdk_cosmos = path.join(__dirname, "../../../sdk/ewallet_sdk_cosmos/");

  const sandbox_simple_host = path.join(
    __dirname,
    "../../../sdk/sandboxes/sandbox_simple_host/",
  );

  const crypto_bytes = path.join(__dirname, "../../../crypto/bytes/");

  const tecdsa_interface = path.join(
    __dirname,
    "../../../crypto/tecdsa/tecdsa_interface/",
  );

  return {
    root,
    stdlib,
    dotenv,
    sdk_core,
    sdk_eth,
    sdk_cosmos,
    sdk_common,
    crypto_bytes,
    ksn_interface,
    ksn_server,
    ksn_pg_interface,
    sandbox_simple_host,
    tecdsa_interface,
  };
})();
