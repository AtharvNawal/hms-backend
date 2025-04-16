const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoute = require("./routes/authRoute");
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");
const Patient = require("./models/Patient");
// const patient = require("./models/Patient");
const Appointment = require("./models/Appointment");
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

// Define Mongoose Models
// const Patient = mongoose.model('Patient', new mongoose.Schema({
//     id: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     age: { type: Number, required: true },
//     department: { type: String, required: true },
//     status: { type: String, required: true },
//     lastVisit: { type: String, required: true },
//     nextAppointment: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
// }));

// const Appointment = mongoose.model('Appointment', new mongoose.Schema({
//     id: { type: String, required: true, unique: true },
//     patient: { type: String, required: true },
//     department: { type: String, required: true },
//     date: { type: String, required: true },
//     time: { type: String, required: true },
//     status: { type: String, required: true },
//     reason: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
// }));

// API Endpoints for Patients and Appointments
app.get('/api/patients', async (req, res) => {
    try {
        console.log("Fetching all patients...");

        // Fetch ALL patients from database without any filtering
        const patients = await Patient.find({})
            
        console.log(`Found ${patients.length} patients`);
        
        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching patients',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

app.get('/api/pat', async (req, res) => {
    try {

        console.log("teststtdtsfjys");

        const { search } = req.query;
        let query = {};
        console.log(search)
        // If search query exists, create a search filter
        if (search) {
            console.log("search query exists");
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } }, // Case-insensitive name search
                    { patientId: { $regex: search, $options: 'i' } }, // Case-insensitive ID search
                    { department: { $regex: search, $options: 'i' } } // Case-insensitive department search
                ]
            };
        }
        
        // Fetch patients from database with optional search filter
        const patients = await Patient.find(query)
            .sort({ createdAt: -1 }) // Sort by newest first
            .select('-__v'); // Exclude version key
        console.log(patients);
        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (err) {
        console.log('Backend Error fetching patients:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching patients',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});


app.get('/api/appointments', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { patient: { $regex: search, $options: 'i' } },
                    { id: { $regex: search, $options: 'i' } },
                    { department: { $regex: search, $options: 'i' } }
                ]
            };
        }

        
        const appointments = await Appointment.find(query);
        console.log(appointments[0]);
        console.log(`Found ${appointments.length} appointments`);
        res.json(appointments);
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ message: 'Server error while fetching appointments' });
    }
});

// ✅ Use Routes
app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/user", userRoute);

// Default Route
app.get("/", (req, res) => res.status(200).send("Hospital Management System API"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

// ✅ Export the app for server setup in `index.js`
module.exports = app;