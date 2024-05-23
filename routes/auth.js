// route.js
var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");

// router.get("/google", authController.googleLogin);

// router.get("/google/callback", authController.googleLoginCallback);
router.get("/logout", authController.logout);

router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password/:email", authController.resetPassword);
// router.post("/verify-token/:email", authController.verifiedToken);

module.exports = router;
