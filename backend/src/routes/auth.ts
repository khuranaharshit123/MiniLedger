/*
 * auth.ts — Authentication Routes (Login with Phone + OTP)
 * ==========================================================
 * This file has two routes:
 * 1. POST /auth/send-otp  → Send a mock OTP to a phone number
 * 2. POST /auth/verify-otp → Verify the OTP and get a login token
 *
 * How the login flow works:
 * - User enters their phone number
 * - Server generates a random 6-digit OTP and prints it in the console
 * - User enters the OTP
 * - Server checks if the OTP matches, then gives the user a JWT token
 */

// Import Express Router to define routes
import { Router, Request, Response } from "express";

// Import jsonwebtoken to create login tokens
import jwt from "jsonwebtoken";

// Import our database pool
import pool from "../db";

// Import our phone validation helper
import { validatePhone } from "../utils/validate";

// Import dotenv for environment variables
import dotenv from "dotenv";
dotenv.config();

// Create a new router (a mini-app that handles a group of routes)
const router = Router();

/*
 * Route: POST /auth/send-otp
 * What it does: Generates a 6-digit OTP and saves it to the database
 * Body: { "phone": "9876543210" }
 */
router.post("/send-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the phone number from the request body
    const { phone } = req.body;

    // Validate the phone number using our helper function
    const phoneError = validatePhone(phone);
    if (phoneError) {
      // If validation fails, send back the error message
      res.status(400).json({ error: phoneError });
      return;
    }

    // Generate a random 6-digit OTP
    // Math.random() gives a number between 0 and 1
    // We multiply by 900000 and add 100000 to get a number between 100000-999999
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set the OTP to expire in 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in milliseconds

    // Save the OTP in the database
    // $1, $2, $3 are placeholders that get replaced with the values in the array
    // This prevents SQL injection attacks
    await pool.query(
      "INSERT INTO otps (phone, otp, expires_at) VALUES ($1, $2, $3)",
      [phone, otp, expiresAt]
    );

    // Print the OTP in the server console (MOCK SMS)
    // In a real app, you'd send this via an SMS service like Twilio
    console.log("========================================");
    console.log(`📱 OTP for ${phone}: ${otp}`);
    console.log("========================================");

    // Send success response
    res.json({ message: "OTP sent successfully (check server console)" });
  } catch (error) {
    // If something goes wrong, log the error and send a 500 response
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

/*
 * Route: POST /auth/verify-otp
 * What it does: Checks the OTP, creates user if needed, returns JWT token
 * Body: { "phone": "9876543210", "otp": "123456" }
 */
router.post("/verify-otp", async (req: Request, res: Response): Promise<void> => {
  try {
    // Get phone and OTP from the request body
    const { phone, otp } = req.body;

    // Basic validation
    if (!phone || !otp) {
      res.status(400).json({ error: "Phone number and OTP are required" });
      return;
    }

    // Look for a matching OTP in the database
    // It must: match the phone, match the OTP code, not be expired, not be already used
    const otpResult = await pool.query(
      `SELECT * FROM otps 
       WHERE phone = $1 
         AND otp = $2 
         AND expires_at > NOW() 
         AND used = FALSE 
       ORDER BY expires_at DESC 
       LIMIT 1`,
      [phone, otp]
    );

    // Check if we found a matching OTP
    if (otpResult.rows.length === 0) {
      res.status(400).json({ error: "Invalid or expired OTP" });
      return;
    }

    // Mark the OTP as used so it can't be used again
    await pool.query("UPDATE otps SET used = TRUE WHERE id = $1", [otpResult.rows[0].id]);

    // Check if this phone number already has a user account
    let userResult = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);

    // If no user exists, create a new one
    if (userResult.rows.length === 0) {
      userResult = await pool.query(
        "INSERT INTO users (phone) VALUES ($1) RETURNING *",
        [phone]
      );
      console.log(`🆕 New user created: ${phone}`);
    }

    // Get the user's ID
    const userId = userResult.rows[0].id;

    // Create a JWT token
    // This token contains the userId and expires in 7 days
    // The client will send this token with every request to prove they're logged in
    const token = jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // Send the token back to the client
    res.json({
      message: "Login successful!",
      token: token,
      userId: userId,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Export the router so index.ts can use it
export default router;

