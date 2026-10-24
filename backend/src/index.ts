/*
 * index.ts — Main Server Entry Point
 * =====================================
 * This is the main file that starts our Express server.
 * It does the following:
 * 1. Loads environment variables from .env file
 * 2. Creates an Express app
 * 3. Sets up middleware (cors, json parsing, static files)
 * 4. Connects our route files
 * 5. Initializes the database tables
 * 6. Starts listening for requests
 */

// Step 1: Load environment variables from .env file
// This must be done FIRST so all other files can access process.env variables
import dotenv from "dotenv";
dotenv.config();

// Step 2: Import Express — the web framework we use to build our API
import express from "express";

// Import cors — allows our mobile app to make requests to this server
// Without cors, the browser/app would block requests from a different domain
import cors from "cors";

// Import path — helps us work with file/directory paths
import path from "path";
import fs from "fs";

// Step 3: Import our database initialization function
import { initDB } from "./db";

// Step 4: Import our route files
import authRoutes from "./routes/auth";
import loanRoutes from "./routes/loans";
import summaryRoutes from "./routes/summary";

// Step 5: Create the Express application
const app = express();

// Step 6: Set the port from environment variable, or use 5000 as default
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE SETUP ============

// Enable CORS — allows requests from any origin (our mobile app)
app.use(cors());

// Parse JSON request bodies — allows us to read JSON data sent by the client
// Without this, req.body would be undefined
app.use(express.json());

// Serve uploaded files (receipt photos) as static files
// This means a file at uploads/photo.jpg can be accessed at http://localhost:5000/uploads/photo.jpg
const uploadsDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ============ ROUTES SETUP ============

// Mount auth routes at /auth
// So POST /auth/send-otp and POST /auth/verify-otp will work
app.use("/auth", authRoutes);

// Mount loan routes at /loans
// So POST /loans, GET /loans, PATCH /loans/:id/repay will work
app.use("/loans", loanRoutes);

// Mount summary route at /summary
// So GET /summary will work
app.use("/summary", summaryRoutes);

// ============ HEALTH CHECK ROUTE ============

// A simple route to check if the server is running
// Visit http://localhost:5000/ to see this message
app.get("/", (req, res) => {
  res.json({ message: "🏦 MiniLedger API is running!" });
});

// ============ START THE SERVER ============

// First initialize the database (create tables), then start listening
initDB()
  .then(() => {
    // Database is ready — start the server
    app.listen(PORT, () => {
      console.log("");
      console.log("🏦 ========================================");
      console.log(`🚀 MiniLedger server running on port ${PORT}`);
      console.log(`📡 API URL: http://localhost:${PORT}`);
      console.log("🏦 ========================================");
      console.log("");
    });
  })
  .catch((error) => {
    // If database setup fails, show the error and exit
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  });

// Export the app for testing purposes
export default app;

