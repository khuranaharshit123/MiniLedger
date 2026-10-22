/*
 * auth.ts — Authentication Middleware
 * ====================================
 * This is a "middleware" — a function that runs BEFORE our route handlers.
 * It checks if the user is logged in by verifying their JWT token.
 *
 * How it works:
 * 1. The client sends a token in the "Authorization" header
 * 2. We extract the token and verify it using jsonwebtoken
 * 3. If valid, we attach the userId to the request and move on
 * 4. If invalid or missing, we send back a 401 (Unauthorized) error
 */

// Import the types we need from Express
import { Request, Response, NextFunction } from "express";

// Import jsonwebtoken to verify tokens
import jwt from "jsonwebtoken";

// Import dotenv to access environment variables
import dotenv from "dotenv";
dotenv.config();

/*
 * Extend the Express Request type to include our custom 'userId' field.
 * By default, Express doesn't know about userId — we're adding it ourselves.
 * This tells TypeScript: "hey, Request objects can also have a userId string"
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/*
 * The authentication middleware function
 * It takes 3 parameters that Express provides:
 * - req: the incoming request
 * - res: the response object we use to send replies
 * - next: a function to call when we want to continue to the next handler
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Step 1: Get the Authorization header from the request
  // It looks like: "Bearer eyJhbGciOiJIUzI1NiIs..."
  const authHeader = req.headers.authorization;

  // Step 2: Check if the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No token found — send 401 Unauthorized
    res.status(401).json({ error: "No token provided. Please log in first." });
    return;
  }

  // Step 3: Extract just the token part (remove "Bearer " from the beginning)
  const token = authHeader.split(" ")[1];

  try {
    // Step 4: Verify the token using our secret key
    // jwt.verify() will throw an error if the token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: string };

    // Step 5: Attach the userId from the token to the request object
    // Now our route handlers can access req.userId to know who is making the request
    req.userId = decoded.userId;

    // Step 6: Call next() to continue to the actual route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    res.status(401).json({ error: "Invalid or expired token. Please log in again." });
    return;
  }
}
