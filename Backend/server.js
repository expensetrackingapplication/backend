console.log("Starting server...");

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// --- Standard CORS Setup ---
app.use(cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
}));

// <<< --- THIS IS THE CRITICAL FIX for the 400 Login Error --- >>>
// This middleware MUST be placed BEFORE your routes are defined.
// It tells Express how to read the email and password from the login form.
app.use(express.json());

// --- API Routes ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// --- Serve Static Files for Uploads ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Database Connection and Server Start ---
connectDB();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`DB connected & Server running on port ${PORT}`));