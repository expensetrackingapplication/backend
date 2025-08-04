const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

// This function gets the data for the main dashboard page
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        const totalIncome = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const totalExpense = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const last60DaysIncomeTransactions = await Income.find({
            userId,
            date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });
        const incomelast60Days = last60DaysIncomeTransactions.reduce((sum, txn) => sum + txn.amount, 0);
        const last30DaysExpenseTransactions = await Expense.find({
            userId,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });
        const expenseLast30Days = last30DaysExpenseTransactions.reduce((sum, txn) => sum + txn.amount, 0);
        const recentIncome = await Income.find({ userId }).sort({ date: -1 }).limit(5);
        const recentExpenses = await Expense.find({ userId }).sort({ date: -1 }).limit(5);
        const lastTransactions = [
            ...recentIncome.map((txn) => ({ ...txn.toObject(), type: "income" })),
            ...recentExpenses.map((txn) => ({ ...txn.toObject(), type: "expense" })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        res.json({
            totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpenses: totalExpense[0]?.total || 0,
            last30DaysExpenses: {
                total: expenseLast30Days,
                transactions: last30DaysExpenseTransactions,
            },
            last60DaysIncome: {
                total: incomelast60Days,
                transactions: last60DaysIncomeTransactions,
            },
            recentTransactions: lastTransactions,
            recentIncome: recentIncome,
            recentExpenses: recentExpenses,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// <<<--- NEW FUNCTION ADDED HERE --- >>>
// This function gets ALL transactions (income and expense) for a dedicated page
exports.getAllTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const income = await Income.find({ userId }).sort({ date: -1 });
        const expenses = await Expense.find({ userId }).sort({ date: -1 });

        // Combine and sort all transactions by date
        const allTransactions = [
            ...income.map((txn) => ({ ...txn.toObject(), type: "income" })),
            ...expenses.map((txn) => ({ ...txn.toObject(), type: "expense" })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(allTransactions);

    } catch (error) {
        console.error("Error fetching all transactions:", error);
        res.status(500).json({ message: "Server Error" });
    }
};