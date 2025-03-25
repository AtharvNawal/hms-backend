const express = require("express");
const User = require("../models/User");
const { verifyToken, generateToken } = require("../middleware/auth"); // Import middleware
const jwt = require("jsonwebtoken");
const router = express.Router();


const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!JWT_SECRET) {
	console.error("ERROR: ACCESS_TOKEN_SECRET is not defined in environment variables.");
	process.exit(1); // Stop server if secret is missing
}

// Login Route
router.post("/login", async (req, res) => {
	const { email, password, role } = req.body;

	try {
		const user = await User.findOne({ email, role });
		if (!user) return res.status(404).json({ error: "User not found" });

		if (user.password !== password) {
			return res.status(401).json({ error: "Incorrect email or password." });
		}

		// Generate JWT token
		const accessToken = jwt.sign(
			{ id: user._id, email: user.email, role: user.role },
			JWT_SECRET,
			{ expiresIn: "30m" }
		);

		res.status(200).json({ message: "Login successful", user, accessToken });
	} catch (error) {
		res.status(500).json({ error: "Server error", details: error.message });
	}
});

// Protected Route (Example)
router.get("/profile", verifyToken, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json({ user });
	} catch (error) {
		res.status(500).json({ error: "Server error", details: error.message });
	}
});

module.exports = router;
