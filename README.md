# 💰 MiniLedger — Track Money Lent to Friends

A simple full-stack app to keep track of money you've lent to friends.

- **Backend:** Node.js + TypeScript + Express + PostgreSQL
- **Mobile App:** React Native (Expo) + TypeScript

---

## 📁 Project Structure

```
MiniLedger/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── index.ts      # Main server entry point
│   │   ├── db.ts         # Database connection & table setup
│   │   ├── middleware/
│   │   │   └── auth.ts   # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts   # Phone + OTP login routes
│   │   │   ├── loans.ts  # CRUD routes for loan entries
│   │   │   └── summary.ts# Summary statistics route
│   │   ├── utils/
│   │   │   └── validate.ts# Input validation helpers
│   │   └── __tests__/
│   │       └── validate.test.ts # Unit tests
│   ├── uploads/           # Receipt photos storage
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/               # React Native Expo app
│   ├── src/
│   │   ├── api/
│   │   │   └── api.ts    # API calls to backend
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Auth state management
│   │   ├── components/
│   │   │   ├── SummaryCard.tsx # Summary display card
│   │   │   └── LoanItem.tsx   # Single loan entry display
│   │   └── screens/
│   │       ├── LoginScreen.tsx  # Phone + OTP login
│   │       ├── HomeScreen.tsx   # Main loan list screen
│   │       └── AddLoanScreen.tsx# Form to add new loan
│   ├── App.tsx
│   └── package.json
│
└── README.md             # This file
```

---

## 🚀 How to Run

### Prerequisites

Make sure you have these installed:
- **Node.js** (v18 or later) — [download](https://nodejs.org)
- **PostgreSQL** (v14 or later) — [download](https://www.postgresql.org/download/)
- **Expo CLI** — install with `npm install -g expo-cli`
- **Expo Go app** on your phone (from App Store / Play Store)

---

### Step 1: Set Up the Database

1. Open your PostgreSQL client (pgAdmin or terminal)
2. Create a new database:

```sql
CREATE DATABASE miniledger;
```

That's it! The tables will be created automatically when the server starts.

---

### Step 2: Run the Backend

```bash
# Go to backend folder
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env

# Edit .env and set your PostgreSQL connection string:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/miniledger
# JWT_SECRET=any_random_string_here

# Start the development server
npm run dev
```

The server will start on **http://localhost:5000**

> 📌 When you send an OTP, it will be printed in the terminal (mock SMS).

---

### Step 3: Run the Mobile App

```bash
# Go to mobile folder
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

Then:
- Scan the QR code with **Expo Go** app on your phone
- Or press `a` to open in Android emulator
- Or press `w` to open in web browser

> ⚠️ **Important:** If using a physical device, update the API base URL in  
> `mobile/src/api/api.ts` to your computer's local IP address  
> (e.g., `http://192.168.1.100:5000` instead of `http://10.0.2.2:5000`)

---

## 📡 API Endpoints

| Method  | Endpoint              | Description                    | Auth Required |
|---------|-----------------------|--------------------------------|---------------|
| POST    | `/auth/send-otp`      | Send OTP to phone number       | No            |
| POST    | `/auth/verify-otp`    | Verify OTP and get JWT token   | No            |
| GET     | `/loans`              | Get all loans for the user     | Yes           |
| POST    | `/loans`              | Add a new loan entry           | Yes           |
| PATCH   | `/loans/:id/repay`    | Mark a loan as repaid          | Yes           |
| POST    | `/loans/:id/receipt`  | Upload a receipt photo         | Yes           |
| GET     | `/summary`            | Get lending summary statistics | Yes           |

### Example API Calls

**Send OTP:**
```bash
curl -X POST http://localhost:5000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

**Verify OTP (check your server terminal for the OTP):**
```bash
curl -X POST http://localhost:5000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

**Add a Loan:**
```bash
curl -X POST http://localhost:5000/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"friendName": "Rahul", "amount": 500, "dueDate": "2026-12-01"}'
```

**Get Summary:**
```bash
curl http://localhost:5000/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

This runs the input validation tests using Jest.

---

## 🔑 How Authentication Works

1. User enters their phone number
2. Server generates a random 6-digit OTP and prints it to the console (mock SMS)
3. User enters the OTP
4. Server verifies the OTP, creates the user (if new), and returns a JWT token
5. The mobile app stores this token and sends it with every API request

---

## 🛠️ Tech Stack Explained

| Technology   | Why We Use It                                    |
|--------------|--------------------------------------------------|
| Node.js      | JavaScript runtime for the server                |
| Express      | Simple web framework to create API endpoints     |
| TypeScript   | Adds types to JavaScript (fewer bugs)            |
| PostgreSQL   | Reliable database to store our data              |
| JWT          | Secure tokens for user authentication            |
| React Native | Build mobile apps using React (one codebase)     |
| Expo         | Makes React Native development much easier       |
| Axios        | HTTP client to call our API from the app         |

---

## 📸 Bonus Features

- **Receipt Upload:** Take a photo of a receipt and attach it to a loan entry
- **Input Validation:** Both client and server validate inputs
- **Unit Tests:** Validation functions are tested with Jest

---

## 📝 License

This project is for educational purposes.
