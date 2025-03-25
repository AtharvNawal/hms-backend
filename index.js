require("dotenv").config(); // Ensure environment variables are loaded

const app = require("./app"); // Import the Express app instance

const PORT = process.env.PORT || 5001; // Use PORT from .env, default to 5001

app.listen(PORT, () => {
    console.info(`🚀 Server is running on http://localhost:${PORT}`);
});
