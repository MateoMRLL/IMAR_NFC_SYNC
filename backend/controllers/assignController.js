const AssignService = require("../services/assignService");

class AssignController {
  static async assignTag(req, res) {
    const result = await AssignService.assign(req.body);
    res.json({
      success: true,
      message: "Assignment registered successfully",
      data: result,
    });
    try {
    } catch (error) {
      console.error("Assign Error :", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
module.exports = AssignController;
