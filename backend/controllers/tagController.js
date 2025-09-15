const TagService = require("../services/tagService");

class TagController {
  static async getAllTags(req, res) {
    try {
      const result = await TagService.getAllTags();
      res.json({
        success: true,
        message: "Tags fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error("Failed to fetch Tags:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = TagController;
