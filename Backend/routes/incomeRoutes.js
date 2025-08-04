const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
    addIncome,
    getAllIncome,
    deleteIncome,
    updateIncome,
    downloadIncomeExcel
} = require("../controllers/incomeController");

const router = express.Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncome);
router.delete("/:id", protect, deleteIncome);
router.put("/:id", protect, updateIncome);
router.get("/downloadexcel", protect, downloadIncomeExcel);

module.exports = router;