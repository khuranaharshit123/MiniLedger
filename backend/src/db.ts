/*
 * db.ts — Database Connection & Setup
 * ====================================
 * This file does two things:
 * 1. Creates a "pool" (a connection to our PostgreSQL database)
 * 2. Has a function to create our database tables when the server starts
 *
 * We use the 'pg' library to talk to PostgreSQL.
 * A "pool" keeps multiple connections open so queries are faster.
 */

// Import Pool from the 'pg' library — it manages database connections
import { Pool } from "pg";

// Import dotenv so we can read the .env file
import dotenv from "dotenv";

// Load environment variables from .env file into process.env
dotenv.config();

// Create a new connection pool using our database URL from the .env file
// The DATABASE_URL looks like: postgresql://username:password@host:port/database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/*
 * initDB() — Creates all the database tables
 * This runs when the server starts.
 * "IF NOT EXISTS" means it won't crash if the tables already exist.
 */
export async function initDB(): Promise<void> {
  // We use pool.query() to run SQL commands

  // Table 1: users — stores registered users (just phone numbers)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
      phone VARCHAR(15) UNIQUE NOT NULL,              
      created_at TIMESTAMP DEFAULT NOW()              
    )
  `);
  // id: unique ID generated automatically (UUID = random unique string)
  // phone: the user's phone number (unique, so no duplicates)
  // created_at: when the user registered

  // Table 2: otps — stores OTP codes sent to users for login
  await pool.query(`
    CREATE TABLE IF NOT EXISTS otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone VARCHAR(15) NOT NULL,         
      otp VARCHAR(6) NOT NULL,            
      expires_at TIMESTAMP NOT NULL,      
      used BOOLEAN DEFAULT FALSE          
    )
  `);
  // phone: which phone number this OTP is for
  // otp: the 6-digit code
  // expires_at: when this OTP stops being valid
  // used: whether this OTP has already been used

  // Table 3: loans — stores money-lending entries
  await pool.query(`
    CREATE TABLE IF NOT EXISTS loans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),  
      friend_name VARCHAR(100) NOT NULL,  
      amount DECIMAL(10,2) NOT NULL,      
      due_date DATE NOT NULL,             
      is_repaid BOOLEAN DEFAULT FALSE,    
      receipt_url VARCHAR(500),           
      created_at TIMESTAMP DEFAULT NOW()  
    )
  `);
  // user_id: links to the user who created this entry (foreign key)
  // friend_name: who borrowed the money
  // amount: how much money was lent (up to 10 digits, 2 decimal places)
  // due_date: when the money should be returned
  // is_repaid: has the friend paid back?
  // receipt_url: optional photo of a receipt

  console.log("✅ Database tables created successfully!");
}

// Export the pool so other files can use it to query the database
export default pool;

