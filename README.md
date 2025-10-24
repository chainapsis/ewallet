<a href="https://demo.oko.app/">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://keplr-ewallet.s3.ap-northeast-2.amazonaws.com/icons/oko_product_logo_light2.svg">
    <source media="(prefers-color-scheme: dark)" srcset="https://keplr-ewallet.s3.ap-northeast-2.amazonaws.com/icons/oko_product_logo_dark2.svg">
    <img src="https://keplr-ewallet.s3.ap-northeast-2.amazonaws.com/icons/oko_product_logo_light2.svg" alt="Logo"
    style="width: 240px; height: auto;">
  </picture>
</a>

Crypto wallet seamlessly built in your apps.

Using the latest advances in cryptography, Oko delivers a seamless
experience by integrating the security of blockchain wallets directly into web
or mobile apps.

- 🔒**Enhanced Security**: Multi-party computation to generate signature
- 🚀 **Better User Experience**: No browser extension, no secret phrases, sign
  in with a social account.
- ⚡**Developer Friendly**: Simple integration, wallet programmability

[Explore the docs »](https://docs.oko.app)

[View Demo](https://demo.oko.app)

## Oko SDK

<!-- TODO: update sdk names and links -->

| Packages                                                 | Latest                                                                                                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [@oko-wallet/oko-sdk-core](sdk/oko_sdk_core)     | [![npm version](https://img.shields.io/npm/v/@oko-wallet/oko-sdk-core.svg)](https://www.npmjs.com/package/@oko-wallet/oko-sdk-core)     |
| [@oko-wallet/oko-sdk-cosmos](sdk/oko_sdk_cosmos) | [![npm version](https://img.shields.io/npm/v/@oko-wallet/oko-sdk-cosmos.svg)](https://www.npmjs.com/package/@oko-wallet/oko-sdk-cosmos) |
| [@oko-wallet/oko-sdk-eth](sdk/oko_sdk_eth)       | [![npm version](https://img.shields.io/npm/v/@oko-wallet/oko-sdk-eth.svg)](https://www.npmjs.com/package/@oko-wallet/oko-sdk-eth)       |

## How it works

TBD

## Running a key share node

Please refer to the
[document](https://github.com/chainapsis/ewallet/blob/main/documentation/key_share_node.md).

## Contributing

Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and
create a pull request. You can also simply open an issue.

### Code Formatting

This project uses _Biome_ for code formatting.

For installation, you can refer to the following documentations

- VSCode, IntelliJ: https://biomejs.dev/guides/editors/first-party-extensions/
- Other IDEs: https://biomejs.dev/guides/editors/third-party-extensions/

Biome provides two major operations: format and check

- The difference between `format` and `check` is that `check` also runs lint
  with format.

## Security

TBD

## License

Distributed under the GPL v3 License. See
[GPL V3 License](https://opensource.org/license/gpl-3-0) for more information.

## Development

### Prerequisites

- Postgres 17+

#### pg_dump

During development, key share node assumes the system has "pg_dump" executable.
pg_dump should be installed while installing Postgres. One way to install on
MacOS is as follows.

```sh
brew install postgresql@18
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```
