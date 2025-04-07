const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoute = require("./routes/authRoute");
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Retrieve MONGO_URI from environment variables
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/HMS"; // Default fallback

// ✅ Improved MongoDB Connection with Better Error Handling
mongoose
    .connect(MONGO_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        serverSelectionTimeoutMS: 30000, // Increase timeout (prevents timeout errors)
    })
    .then(() => console.info("✅ MongoDB Connected Successfully"))
    .catch((err) => {
        console.error("❌ Error Connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    });

// ✅ Use Routes
app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/user", userRoute);

// Default Route
app.get("/", (req, res) => res.status(200).send("Hello World!"));

// ✅ Export the app for server setup in `index.js`
module.exports = app;
