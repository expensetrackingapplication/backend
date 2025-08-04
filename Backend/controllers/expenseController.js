const Expense = require("../models/Expense");
const xlsx = require('xlsx');

// Add Expense Source
exports.addExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, category, amount, date } = req.body;
        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Server-side validation for future date
        if (new Date(date) > new Date()) {
            return res.status(400).json({ message: "Date cannot be in the future." });
        }
        const newExpense = new Expense({ userId, icon, category, amount, date: new Date(date) });
        await newExpense.save();
        res.status(200).json(newExpense);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all Expense Source
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;
    try {
        const expense = await Expense.find({ userId }).sort({ date: -1 });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete Expense Source
exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "server Error" });
    }
};

// Update Expense Source
exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { icon, category, amount, date } = req.body;
    try {
        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Server-side validation for future date
        if (new Date(date) > new Date()) {
            return res.status(400).json({ message: "Date cannot be in the future." });
        }
        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            { icon, category, amount, date: new Date(date) },
            { new: true }
        );
        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense record not found" });
        }
        res.status(200).json(updatedExpense);
    } catch (err) {
        console.error("Error updating expense:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Download expense Source
exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const expense = await Expense.find({ userId }).sort({ date: -1 });
        const data = expense.map((item) => ({
            Category: item.category,
            Amount: item.amount,
            Date: item.date ? item.date.toISOString().split('T')[0] : "",
        }));
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Expense");
        const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=expense_details.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);
    } catch (error) {
        console.error("Error generating Excel file:", error);
        res.status(500).json({ message: "Server Error" });
    }
};