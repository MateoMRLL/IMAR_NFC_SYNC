const AssignService = require("../services/assignService");

class AssignController {
  static async assignTag(req, res) {
    try {
      const result = await AssignService.assign(req.body);
      res.status(200).json({
        success: true,
        message: "Assignment registered successfully",
        data: result,
      });
    } catch (error) {
      console.error("Assign Error :", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async checkAssignment(req, res) {
    try {
      const result = AssignService.isTagAssigned(req.body);
      console.log(result);
      res.status(200).json({
        success: true,
        message: "This tag can be assigned",
        data: result,
      });
    } catch (error) {
      console.error("This tag can't be assigned :", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = AssignController;
