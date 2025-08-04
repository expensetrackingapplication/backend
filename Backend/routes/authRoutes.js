// --- REPLACE THE ENTIRE CONTENT of Backend/routes/authRoutes.js ---

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Your upload middleware

// Import all the necessary functions from your controller
const {
    registerUser,
    loginUser,
    getUserInfo,
    deleteUser,
    updateUserProfile,
    updateProfilePicture,
} = require("../controllers/authController");

const router = express.Router();

// --- Core Authentication Routes ---
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);

// --- User Profile Management Routes ---
router.delete('/delete-profile', protect, deleteUser);
router.put("/profile", protect, updateUserProfile);

// <<<--- THIS IS THE VERIFIED AND CORRECTED LINE --- >>>
// This route now correctly uses the upload middleware to look for a field named "profileImage".
router.post("/profile-picture", protect, upload.single("profileImage"), updateProfilePicture);

module.exports = router;