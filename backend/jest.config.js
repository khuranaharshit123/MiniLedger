/*
 * Jest Configuration File
 * -----------------------
 * This tells Jest how to run our TypeScript tests.
 * We use "ts-jest" so Jest can understand TypeScript files.
 */

module.exports = {
  // Use ts-jest to transform TypeScript files before testing
  preset: "ts-jest",

  // We are running tests in a Node.js environment (not a browser)
  testEnvironment: "node",

  // Where to look for test files
  // This pattern matches any file ending in .test.ts inside __tests__ folders
  testMatch: ["**/__tests__/**/*.test.ts"],
};
