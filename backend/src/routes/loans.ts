/*
 * loans.ts — Loan Entry Routes (CRUD Operations)
 * =================================================
 * This file handles all the loan-related API endpoints:
 * 1. POST   /loans           → Add a new loan entry
 * 2. GET    /loans           → Get all loans for the logged-in user
 * 3. PATCH  /loans/:id/repay → Mark a loan as repaid
 * 4. POST   /loans/:id/receipt → Upload a receipt photo for a loan
 *
 * All routes require authentication (user must be logged in).
 */

// Import Express types
import { Router, Request, Response } from "express";

// Import multer for handling file uploads (receipt photos)
import multer from "multer";

// Import path to work with file paths
import path from "path";

// Import our database pool
import pool from "../db";

// Import auth middleware — this checks if the user is logged in
import { authMiddleware } from "../middleware/auth";

// Import validation helper
import { validateLoanInput } from "../utils/validate";

// Create a new router
const router = Router();

/*
 * Set up Multer for file uploads
 * Multer handles multipart/form-data (how files are sent over HTTP)
 * We configure WHERE to save files and WHAT to name them
 */
const storage = multer.diskStorage({
  // Where to save uploaded files
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads")); // Save in the uploads/ folder
  },
  // What to name the uploaded file
  filename: (req, file, cb) => {
    // Create a unique name: timestamp + random number + original extension
    // Example: 1698000000000-12345.jpg
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 100000);
    const extension = path.extname(file.originalname); // Get file extension (.jpg, .png, etc.)
    cb(null, uniqueName + extension);
  },
});

// Create the multer upload handler
// We limit file size to 5MB and only allow image files
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: (req, file, cb) => {
    // Only allow image files (jpeg, jpg, png, gif)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)"));
    }
  },
});

/*
 * Route: POST /loans
 * What it does: Creates a new loan entry
 * Body: { "friendName": "Rahul", "amount": 500, "dueDate": "2025-12-01" }
 * Requires: Authentication (JWT token in header)
 */
router.post("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the data from the request body
    const { friendName, amount, dueDate } = req.body;

    // Validate the input using our helper function
    const validationError = validateLoanInput(friendName, amount, dueDate);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    // Insert the new loan into the database
    // req.userId comes from the auth middleware (it decoded the JWT token)
    const result = await pool.query(
      `INSERT INTO loans (user_id, friend_name, amount, due_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [req.userId, friendName, amount, dueDate]
    );

    // Send back the created loan entry
    res.status(201).json({
      message: "Loan entry created!",
      loan: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

/*
 * Route: GET /loans
 * What it does: Returns all loan entries for the logged-in user
 * Requires: Authentication
 */
router.get("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all loans for this user, newest first
    const result = await pool.query(
      "SELECT * FROM loans WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );

    // Send the list of loans
    res.json({ loans: result.rows });
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

/*
 * Route: PATCH /loans/:id/repay
 * What it does: Marks a specific loan as "repaid"
 * The :id in the URL is the loan's unique ID
 * Requires: Authentication
 */
router.patch("/:id/repay", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the loan ID from the URL parameters
    const loanId = req.params.id;

    // Update the loan — but ONLY if it belongs to the current user
    // This prevents users from modifying each other's loans
    const result = await pool.query(
      `UPDATE loans 
       SET is_repaid = TRUE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [loanId, req.userId]
    );

    // Check if we found and updated the loan
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Loan not found or doesn't belong to you" });
      return;
    }

    // Send back the updated loan
    res.json({
      message: "Loan marked as repaid!",
      loan: result.rows[0],
    });
  } catch (error) {
    console.error("Error marking loan as repaid:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

/*
 * Route: POST /loans/:id/receipt
 * What it does: Uploads a receipt photo for a specific loan
 * The file should be sent as multipart/form-data with field name "receipt"
 * Requires: Authentication
 */
router.post(
  "/:id/receipt",
  authMiddleware,
  upload.single("receipt"), // multer middleware to handle single file upload
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Get the loan ID from the URL
      const loanId = req.params.id;

      // Check if a file was uploaded
      if (!req.file) {
        res.status(400).json({ error: "No receipt image uploaded" });
        return;
      }

      // Create the URL path for the uploaded file
      // This will be something like: /uploads/1698000000000-12345.jpg
      const receiptUrl = `/uploads/${req.file.filename}`;

      // Update the loan with the receipt URL — only if it belongs to this user
      const result = await pool.query(
        `UPDATE loans 
         SET receipt_url = $1 
         WHERE id = $2 AND user_id = $3 
         RETURNING *`,
        [receiptUrl, loanId, req.userId]
      );

      // Check if we found the loan
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Loan not found or doesn't belong to you" });
        return;
      }

      // Send back the updated loan with receipt URL
      res.json({
        message: "Receipt uploaded successfully!",
        loan: result.rows[0],
      });
    } catch (error) {
      console.error("Error uploading receipt:", error);
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  }
);

// Export the router
export default router;

