const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();

router.post("/send-code", AuthController.sendCode);
router.post("/verify-code", AuthController.verifyCode);
router.post("/resend-code", AuthController.resendCode);

module.exports = router;
