export default {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFilesAfterEnv: [
    // "<rootDir>/src/jest-setup.ts"
  ],
  testTimeout: 60000,
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};
