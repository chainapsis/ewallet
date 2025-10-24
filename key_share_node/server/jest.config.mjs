import { createDefaultEsmPreset } from "ts-jest";

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...createDefaultEsmPreset(),
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  moduleNameMapper: {
    "^@oko-wallet-ksn-server/(.*)$": "<rootDir>/src/$1",
  },
};
