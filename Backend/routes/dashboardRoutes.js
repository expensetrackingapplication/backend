const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getDashboardData, getAllTransactions } = require("../controllers/dashboardController");

const router = express.Router();

// Route for the main dashboard data
router.get("/", protect, getDashboardData);

// <<<--- NEW ROUTE ADDED HERE --- >>>
// Route for the "All Transactions" page
router.get("/transactions", protect, getAllTransactions);

module.exports = router;