/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  moduleNameMapper: {
    "^@oko-wallet-sdk-cosmos/(.*)$": "<rootDir>/src/$1",
    "^@oko-wallet-sdk-core/(.*)$": "<rootDir>/../ewallet_sdk_core/src/$1",
  },
  setupFilesAfterEnv: [],
};
