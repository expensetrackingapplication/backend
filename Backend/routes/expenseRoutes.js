const express = require("express");
const {
    addExpense,
    getAllExpense,
    deleteExpense,
    downloadExpenseExcel,
    updateExpense, // <-- Import the new function
} = require("../controllers/expenseController");
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

// <<<--- NEW ROUTE ADDED HERE --- >>>
router.put("/:id", protect, updateExpense); // Route for updating an expense record

module.exports = router;