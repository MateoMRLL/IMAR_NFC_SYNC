const UserService = require("../services/userService");

class UserController {
  static async register(req, res) {
    try {
      const result = await UserService.registerUser(req.body);

      res.status(200).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const result = await UserService.getAllUsers();

      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error("Failed to fetch Users:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getOneUser(req, res) {
    try {
      const result = await UserService.getUserFromCloud(req.params.uuid);
      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error("Failed to fetch User:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = UserController;
