const express = require("express");
const userController = require("../controller/userController");
const auth = require("../middleware/auth");

router = express();

router.get("/view", auth.verifyToken, userController.view);
router.get("/getApt/:userId", auth.verifyToken, userController.getApt);
router.get("/", (req, res) => {
	console.log("working")
	res.status(200).send("sfd")
})

router.post("/login", userController.login, auth.generateToken, (req, res) => {
	const result = {
		...req.user._doc,
		role: 'patient'
	}
	res.status(200).json({
		message: "Login Successful",
		accessToken: req.accessToken,
		user: result,
	});
	console.info(`Welcome back, ${req.user.email}`);
});
router.post("/makeApt", auth.verifyToken, userController.makeApt);
router.post("/signup", userController.signup);
module.exports = router;
