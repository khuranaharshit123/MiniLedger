/*
 * summary.ts — Summary/Stats Route
 * ===================================
 * This file has one route that returns a summary of the user's lending activity:
 * - Total Lent: how much money they've lent in total
 * - Total Repaid: how much has been paid back
 * - Overdue Amount: how much is overdue (past the due date and not repaid)
 *
 * This data is shown on the summary card at the top of the mobile app.
 */

// Import Express types
import { Router, Request, Response } from "express";

// Import our database pool
import pool from "../db";

// Import auth middleware
import { authMiddleware } from "../middleware/auth";

// Create a new router
const router = Router();

/*
 * Route: GET /summary
 * What it does: Returns lending statistics for the logged-in user
 * Requires: Authentication
 *
 * Response format:
 * {
 *   "totalLent": 5000,
 *   "totalRepaid": 2000,
 *   "overdueAmount": 1500
 * }
 */
router.get("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // Query 1: Get the total amount of ALL loans for this user
    // COALESCE means: if the SUM is null (no loans), use 0 instead
    const totalLentResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM loans WHERE user_id = $1",
      [req.userId]
    );

    // Query 2: Get the total amount of REPAID loans
    const totalRepaidResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM loans WHERE user_id = $1 AND is_repaid = TRUE",
      [req.userId]
    );

    // Query 3: Get the total amount of OVERDUE loans
    // A loan is overdue if: due_date is in the past AND it hasn't been repaid
    // CURRENT_DATE gives today's date in PostgreSQL
    const overdueResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM loans WHERE user_id = $1 AND is_repaid = FALSE AND due_date < CURRENT_DATE",
      [req.userId]
    );

    // Send the summary as JSON
    // parseFloat converts the string values from PostgreSQL to numbers
    res.json({
      totalLent: parseFloat(totalLentResult.rows[0].total),
      totalRepaid: parseFloat(totalRepaidResult.rows[0].total),
      overdueAmount: parseFloat(overdueResult.rows[0].total),
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Export the router
export default router;
