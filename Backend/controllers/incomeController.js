const Income = require("../models/Income");
const xlsx = require('xlsx');

// Add Income Source
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const { icon, source, amount, date } = req.body;
        if (!source || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Server-side validation for future date
        if (new Date(date) > new Date()) {
            return res.status(400).json({ message: "Date cannot be in the future." });
        }
        const newIncome = new Income({ userId, icon, source, amount, date: new Date(date) });
        await newIncome.save();
        res.status(200).json(newIncome);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get all Income Source
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await Income.find({ userId }).sort({ date: -1 });
        res.json(income);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete Income Source
exports.deleteIncome = async (req, res) => {
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "server Error" });
    }
};

// Update Income Source
exports.updateIncome = async (req, res) => {
    const { id } = req.params;
    const { icon, source, amount, date } = req.body;
    try {
        if (!source || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Server-side validation for future date
        if (new Date(date) > new Date()) {
            return res.status(400).json({ message: "Date cannot be in the future." });
        }
        const updatedIncome = await Income.findByIdAndUpdate(
            id,
            { icon, source, amount, date: new Date(date) },
            { new: true }
        );
        if (!updatedIncome) {
            return res.status(404).json({ message: "Income record not found" });
        }
        res.status(200).json(updatedIncome);
    } catch (err) {
        console.error("Error updating income:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Download Income Source
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await Income.find({ userId }).sort({ date: -1 });
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date ? item.date.toISOString().split('T')[0] : "",
        }));
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Income");
        const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=income_details.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);
    } catch (error) {
        console.error("Error generating income Excel file:", error);
        res.status(500).json({ message: "Server Error" });
    }
};