/*
 * validate.test.ts — Unit Tests for Validation Functions
 * ========================================================
 * These tests check if our validation functions work correctly.
 * We use Jest (a testing framework) to run these tests.
 *
 * Each test uses:
 * - describe() to group related tests together
 * - it() or test() to define a single test case
 * - expect() to check if the result matches what we expect
 *
 * Run tests with: npm test
 */

// Import the validation functions we want to test
import { validatePhone, validateLoanInput } from "../utils/validate";

// ============ TESTS FOR validatePhone() ============

describe("validatePhone", () => {
  // Test 1: Should reject empty/missing phone
  it("should return error when phone is not provided", () => {
    const result = validatePhone(undefined);
    expect(result).toBe("Phone number is required");
  });

  // Test 2: Should reject phone with letters
  it("should return error when phone contains non-digit characters", () => {
    const result = validatePhone("98765abcde");
    expect(result).toBe("Phone number must contain only digits");
  });

  // Test 3: Should reject phone that is too short
  it("should return error when phone is too short (less than 10 digits)", () => {
    const result = validatePhone("12345");
    expect(result).toBe("Phone number must be between 10 and 15 digits");
  });

  // Test 4: Should accept a valid 10-digit phone number
  it("should return null for a valid phone number", () => {
    const result = validatePhone("9876543210");
    expect(result).toBeNull(); // null means "no error"
  });
});

// ============ TESTS FOR validateLoanInput() ============

describe("validateLoanInput", () => {
  // Test 5: Should reject missing friend name
  it("should return error when friend name is missing", () => {
    const result = validateLoanInput(undefined, 500, "2025-12-01");
    expect(result).toBe("Friend name is required");
  });

  // Test 6: Should reject empty friend name
  it("should return error when friend name is empty string", () => {
    const result = validateLoanInput("   ", 500, "2025-12-01");
    expect(result).toBe("Friend name is required");
  });

  // Test 7: Should reject negative amount
  it("should return error when amount is negative", () => {
    const result = validateLoanInput("Rahul", -100, "2025-12-01");
    expect(result).toBe("Amount must be a positive number");
  });

  // Test 8: Should reject zero amount
  it("should return error when amount is zero", () => {
    const result = validateLoanInput("Rahul", 0, "2025-12-01");
    expect(result).toBe("Amount must be a positive number");
  });

  // Test 9: Should reject missing due date
  it("should return error when due date is missing", () => {
    const result = validateLoanInput("Rahul", 500, undefined);
    expect(result).toBe("Due date is required");
  });

  // Test 10: Should reject invalid date format
  it("should return error for invalid date format", () => {
    const result = validateLoanInput("Rahul", 500, "not-a-date");
    expect(result).toBe("Due date must be a valid date (YYYY-MM-DD)");
  });

  // Test 11: Should accept valid loan input
  it("should return null for valid loan input", () => {
    const result = validateLoanInput("Rahul", 500, "2025-12-01");
    expect(result).toBeNull(); // null means "no error — everything is valid"
  });
});

