/*
 * api.ts — API Client (Talks to our Backend Server)
 * ===================================================
 * This file creates functions that call our backend API.
 * We use "axios" — a popular HTTP client library.
 *
 * Each function maps to one API endpoint on the server.
 * The mobile app calls these functions instead of making
 * raw HTTP requests directly.
 */

// Import axios to make HTTP requests
import axios from "axios";

/*
 * Create an axios "instance" with a base URL.
 * All requests made with this instance will automatically
 * prepend this URL. So api.get("/loans") becomes GET http://10.0.2.2:5000/loans
 *
 * 🔧 IMPORTANT:
 * - "10.0.2.2" is a special IP that Android emulator uses to reach localhost
 * - If you're using a physical phone, change this to your computer's IP
 *   (e.g., "http://192.168.1.100:5000")
 * - You can find your IP by running "ipconfig" (Windows) or "ifconfig" (Mac/Linux)
 */
const API_BASE_URL = "http://10.0.2.2:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Wait max 10 seconds for a response
});

// ============ AUTH API FUNCTIONS ============

/*
 * sendOtp() — Request an OTP for a phone number
 * Calls: POST /auth/send-otp
 */
export async function sendOtp(phone: string) {
  // Send a POST request with the phone number in the body
  const response = await api.post("/auth/send-otp", { phone });
  return response.data; // Return the server's response
}

/*
 * verifyOtp() — Verify the OTP and get a login token
 * Calls: POST /auth/verify-otp
 * Returns: { token, userId, message }
 */
export async function verifyOtp(phone: string, otp: string) {
  const response = await api.post("/auth/verify-otp", { phone, otp });
  return response.data; // Contains the JWT token
}

// ============ LOANS API FUNCTIONS ============

/*
 * getLoans() — Fetch all loan entries for the logged-in user
 * Calls: GET /loans
 * We pass the JWT token in the Authorization header
 */
export async function getLoans(token: string) {
  const response = await api.get("/loans", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // Contains { loans: [...] }
}

/*
 * addLoan() — Create a new loan entry
 * Calls: POST /loans
 */
export async function addLoan(
  token: string,
  friendName: string,
  amount: number,
  dueDate: string
) {
  const response = await api.post(
    "/loans",
    { friendName, amount, dueDate }, // Request body
    { headers: { Authorization: `Bearer ${token}` } } // Auth header
  );
  return response.data;
}

/*
 * markRepaid() — Mark a loan as paid back
 * Calls: PATCH /loans/:id/repay
 */
export async function markRepaid(token: string, loanId: string) {
  const response = await api.patch(
    `/loans/${loanId}/repay`,
    {}, // Empty body (we don't need to send any data)
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// ============ SUMMARY API FUNCTION ============

/*
 * getSummary() — Get lending statistics
 * Calls: GET /summary
 * Returns: { totalLent, totalRepaid, overdueAmount }
 */
export async function getSummary(token: string) {
  const response = await api.get("/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// ============ RECEIPT UPLOAD FUNCTION ============

/*
 * uploadReceipt() — Upload a receipt photo for a loan
 * Calls: POST /loans/:id/receipt
 *
 * This uses FormData because we're uploading a file (not just JSON).
 * FormData is like a virtual HTML form that can include files.
 */
export async function uploadReceipt(
  token: string,
  loanId: string,
  imageUri: string
) {
  // Create a FormData object (like an HTML form)
  const formData = new FormData();

  // Add the image file to the form
  // We need to provide: uri, type, and name
  formData.append("receipt", {
    uri: imageUri,
    type: "image/jpeg",
    name: "receipt.jpg",
  } as any);

  // Send the form data with proper headers
  const response = await api.post(`/loans/${loanId}/receipt`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // Tell server we're sending a file
    },
  });
  return response.data;
}
