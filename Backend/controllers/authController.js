const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const sendEmail = require("../utils/sendEmail");


// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// --- Register User (with Welcome Email) ---
exports.registerUser = async (req, res) => {
    const { fullName, email, password, profileUrl } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const user = await User.create({ fullName, email, password, profileUrl });

        // Send welcome email
        await sendEmail({
            to: email,
            subject: "🎉 Welcome to Expense Tracking Application!",
            text: `Hi ${fullName},\n\nThank you for signing up for the Expense Tracking Application! You can now manage your income, monitor your spending, and take control of your finances.\n\nStart by logging your first transaction today!\n\n— The Expense Tracking Application Team`,
            html: `
    <h2>Welcome to <span style="color:#2e86de;">Expense Tracking Application</span>, ${fullName}!</h2>
    <p>We're excited to have you on board. With your new account, you can now:</p>
    <ul>
      <li>💰 Track income and expenses</li>
      <li>📈 Monitor financial trends</li>
      <li>🎯 Set savings goals</li>
    </ul>
    <p>Get started by adding your first transaction and watch your budget come to life!</p>
    <p style="margin-top:20px;">— The Expense Tracking Application Team</p>
  `,
        });

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};


// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" })
    }
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: "Error loging In user", error: err.message });
    }
};

// User info
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Error getting user user", error: err.message });
    }
};

// Delete User Profile
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;
        await Income.deleteMany({ userId: userId });
        await Expense.deleteMany({ userId: userId });
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User account and all associated data have been permanently deleted." });
    } catch (err) {
        console.error("Error during user deletion:", err);
        res.status(500).json({ message: "Server error while deleting user account", error: err.message });
    }
};

// Update User Profile (Name, Email, Password)
exports.updateUserProfile = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            user.email = email;
        }
        if (fullName) {
            user.fullName = fullName;
        }
        if (password) {
            user.password = password;
        }
        const updatedUser = await user.save();
        updatedUser.password = undefined;
        res.status(200).json({
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (err) {
        console.error("Error updating user profile:", err);
        res.status(500).json({ message: "Server error while updating profile", error: err.message });
    }
};

// Update Profile Picture
exports.updateProfilePicture = async (req, res) => {
    // <<<--- DEBUGGING LOGS ADDED HERE --- >>>
    console.log("--- updateProfilePicture endpoint hit ---");
    console.log("Request Body:", req.body); // This should be empty or contain text fields
    console.log("Request File:", req.file); // This is the crucial log we need to check

    try {
        if (!req.file) {
            console.error(">>> ERROR: req.file is undefined. Multer middleware failed or is misconfigured.");
            return res.status(400).json({ message: "No file was uploaded, or the file type was not an image." });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profileUrl: imageUrl },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        console.log("✅ Successfully updated profile picture for user:", user.email);
        res.status(200).json(user);

    } catch (err) {
        console.error(">>> CRASH in updateProfilePicture controller:", err);
        res.status(500).json({ message: "Server error while updating profile picture." });
    }
};