const AuthService = require("../services/authService");

class AuthController {
  static async sendCode(req, res) {
    try {
      const result = await AuthService.generateSendCode(req.body);
      res.status(200).json({
        success: result.success,
        message: result.success
          ? "Verification code sent"
          : result.message || "Error sending email",
        data: result.data || null,
      });
    } catch (error) {
      console.error("SendCode Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async verifyCode(req, res) {
    try {
      const result = await AuthService.verifyCode(req.body);
      res.status(200).json({
        success: result.success,
        message: result.success ? "Code verified" : result.message,
        data: result.data || null,
      });
    } catch (error) {
      console.error("VerifyCode Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async resendCode(req, res) {
    try {
      const result = await AuthService.resendCode(req.body);
      res.status(200).json({
        success: result.success,
        message: result.success ? "New verification code sent" : result.message,
        data: result.data || null,
      });
    } catch (error) {
      console.error("ResendCode Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = AuthController;
