const express = require("express");
const adminController = require("../hms-backend/controllers/adminController");

const router = express();

router.post("/addDoc", adminController.addDoc);
router.put("/assignDoc/:id", adminController.assignDoc);
router.get("/login", adminController.login);
router.post("/signup", adminController.signup);

module.exports = router;
