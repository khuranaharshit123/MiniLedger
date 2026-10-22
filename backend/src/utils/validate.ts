/*
 * validate.ts — Input Validation Helpers
 * ========================================
 * These are simple functions that check if user input is valid.
 * They return an error message (string) if something is wrong,
 * or null if everything is okay.
 *
 * We keep validation in a separate file so we can:
 * 1. Reuse these functions in different routes
 * 2. Easily test them with unit tests
 */

/*
 * validatePhone() — Check if a phone number is valid
 * Rules: must be provided, must be 10-15 digits only
 *
 * @param phone - the phone number to check
 * @returns error message string if invalid, null if valid
 */
export function validatePhone(phone: string | undefined): string | null {
  // Check if phone was provided
  if (!phone) {
    return "Phone number is required";
  }

  // Check if phone contains only digits (0-9)
  // The regex /^\d+$/ means: start(^), one or more digits(\d+), end($)
  if (!/^\d+$/.test(phone)) {
    return "Phone number must contain only digits";
  }

  // Check if phone is between 10 and 15 digits long
  if (phone.length < 10 || phone.length > 15) {
    return "Phone number must be between 10 and 15 digits";
  }

  // All checks passed — phone is valid
  return null;
}

/*
 * validateLoanInput() — Check if loan entry data is valid
 * Rules:
 * - friendName must be provided
 * - amount must be a positive number
 * - dueDate must be a valid date string
 *
 * @param friendName - name of the friend who borrowed money
 * @param amount - how much money was lent
 * @param dueDate - when the money should be returned
 * @returns error message string if invalid, null if valid
 */
export function validateLoanInput(
  friendName: string | undefined,
  amount: number | undefined,
  dueDate: string | undefined
): string | null {
  // Check if friend name was provided
  if (!friendName || friendName.trim() === "") {
    return "Friend name is required";
  }

  // Check if amount is provided and is a valid number
  if (amount === undefined || amount === null) {
    return "Amount is required";
  }

  // Check if amount is a positive number
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    return "Amount must be a positive number";
  }

  // Check if due date was provided
  if (!dueDate) {
    return "Due date is required";
  }

  // Check if due date is a valid date
  // new Date() will create "Invalid Date" if the string is not a real date
  const dateObj = new Date(dueDate);
  if (isNaN(dateObj.getTime())) {
    return "Due date must be a valid date (YYYY-MM-DD)";
  }

  // All checks passed — loan input is valid
  return null;
}
