/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testTimeout: 60000,
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/dist-test/"],
  moduleNameMapper: {
    "^@oko-wallet-sdk-cosmos/(.*)$": "<rootDir>/src/$1",
    "^@oko-wallet-sdk-core/(.*)$": "<rootDir>/../ewallet_sdk_core/src/$1",
  },
  setupFilesAfterEnv: [],
};
