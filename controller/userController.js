const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");

// ✅ Get Appointments of a Patient
exports.getApt = async (req, res) => {
	try {
		const { userId } = req.params;
		const objectId = mongoose.Types.ObjectId(userId);

		const apts = await Appointment.find({ pid: objectId });

		if (apts.length === 0) {
			console.info(`No appointments for user: ${userId}`);
			return res.status(200).json([]);
		}

		console.info(`Appointments found for user: ${userId}`);
		return res.status(200).json(apts);
	} catch (error) {
		console.error(`Error fetching appointments:`, error);
		return res.status(500).json({ message: "Error fetching appointments" });
	}
};

// ✅ Login User
exports.login = (req, res, next) => {
    let { email, password } = req.body;
    
    Patient.findOne({ email: email })
        .then((user) => {
            if (!user) {
                console.warn("User not found");
                return res.status(404).send("User not found");
            }

            console.info(`User ${email} found`);

            // Compare hashed password
            bcrypt.compare(password, user.password)
                .then((match) => {
                    if (match) {
                        req.user = user;
                        next(); // Proceed to generate token
                    } else {
                        console.warn("Incorrect password");
                        return res.status(401).send("Incorrect password");
                    }
                })
                .catch((error) => {
                    console.error("Error comparing passwords\n", error);
                    return res.status(500).send("Error processing login");
                });
        })
        .catch((error) => {
            console.error("Error querying database\n", error);
            return res.status(500).send("Error querying database");
        });
};


// ✅ Make an Appointment
exports.makeApt = async (req, res) => {
	try {
		const { pid, date, slot } = req.body;
		const objectId = mongoose.Types.ObjectId(pid);

		const user = await Patient.findById(objectId);
		if (!user) {
			console.warn(`User not found: ${pid}`);
			return res.status(404).json({ message: "User does not exist" });
		}

		const appointment = new Appointment({ pid: objectId, date, slot });
		await appointment.save();

		console.info(`New appointment created for patient ${pid}`);
		return res.status(201).json({ message: "Appointment created successfully" });
	} catch (error) {
		console.error("Error creating appointment:", error);
		return res.status(500).json({ message: "Error creating appointment" });
	}
};

// ✅ Signup (Register) User
exports.signup = async (req, res) => {
	try {
		const { name, email, password, age } = req.body;
console.log(req.body)
		// 🔹 Check if user already exists
		const existingUser = await Patient.findOne({ email });
		if (existingUser) {
			console.warn(`User already exists: ${email}`);
			return res.status(400).json({ message: "Email already registered" });
		}

		// 🔹 Hash Password

		const hashedPassword = await bcrypt.hash(password, 10);
			console.log(hashedPassword)
		// 🔹 Save User
		const user = new Patient({ name, email, password: hashedPassword, age });
		await user.save();

		console.info(`New user created: ${name}`);
		return res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		console.error("Error creating user:", error);
		return res.status(500).json({ message: "Error creating user" });
	}
};

// ✅ View All Users
exports.view = async (req, res) => {
	try {
		const users = await Patient.find();
		if (users.length === 0) {
			return res.status(404).json({ message: "No users found" });
		}

		return res.status(200).json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		return res.status(500).json({ message: "Error fetching users" });
	}
};
