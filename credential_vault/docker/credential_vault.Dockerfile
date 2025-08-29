FROM node:22-alpine3.21

# Install PostgreSQL client tools for pg_dump
RUN apk add --no-cache postgresql17-client

# Enable Corepack for Yarn version management
RUN corepack enable

# Create working directory and copy source code
USER node
RUN mkdir -p /home/node/credential_vault/node_modules && chown -R node:node /home/node/credential_vault
RUN mkdir -p /home/node/keplr_ewallet_data && chown -R node:node /home/node/keplr_ewallet_data
WORKDIR /home/node/credential_vault
COPY --chown=node:node . .

# Install dependencies for stdlib-js
WORKDIR /home/node/credential_vault
RUN yarn workspaces focus @keplr-ewallet/stdlib-js

# Build stdlib-js
WORKDIR /home/node/credential_vault/stdlib_js
RUN yarn run build

# Install dependencies for crypto/bytes
WORKDIR /home/node/credential_vault
RUN yarn workspaces focus @keplr-ewallet/bytes

# Build crypto/bytes
WORKDIR /home/node/credential_vault/crypto/bytes
RUN yarn run build

# Install dependencies for cv_interface
WORKDIR /home/node/credential_vault
RUN yarn workspaces focus @keplr-ewallet/credential-vault-interface

# Build cv_interface
WORKDIR /home/node/credential_vault/credential_vault/cv_interface
RUN yarn run build

# Install dependencies for credential_vault server
WORKDIR /home/node/credential_vault
RUN yarn workspaces focus --production \
    @keplr-ewallet/credential-vault-server

WORKDIR /home/node/credential_vault/credential_vault/server

CMD [ "yarn", "start" ]
