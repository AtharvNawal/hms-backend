const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!JWT_SECRET) {
	console.error("ERROR: ACCESS_TOKEN_SECRET is not defined in environment variables.");
	process.exit(1); // Stop server if secret is missing
}

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];

	if (!authHeader) {
		return res.status(401).json({ error: "Access denied. No token provided." });
	}

	const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

	if (!token) {
		return res.status(401).json({ error: "Invalid token format." });
	}

	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({ error: "Invalid or expired token." });
		}

		req.user = decoded; // Attach user data to request
		next();
	});
};

// Middleware to generate a JWT token
exports.generateToken = async(req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: "User data missing for token generation." });
	}

	const accessToken = await generateAccessToken(req.user);
	req.accessToken = accessToken;
	next();
};

// Function to create JWT token
const generateAccessToken = (user) => {
	return jwt.sign(
		{ id: user._id, email: user.email, role: user.role }, // Only include necessary details
		JWT_SECRET,
		{ expiresIn: "30m" }
	);
};
