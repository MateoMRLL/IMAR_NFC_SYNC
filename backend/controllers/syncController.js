const SyncService = require("../services/syncService");

class SyncController {
  /**
   * Synchronise toutes les ressources (users, tags, etc.)
   */
  static async syncAll(req, res) {
    try {
      await SyncService.syncAll();
      res.status(200).json({
        success: true,
        message: "Toutes les ressources ont été synchronisées avec succès.",
      });
    } catch (error) {
      console.error("Error in syncAll:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de la synchronisation.",
        details: error.message,
      });
    }
  }

  /**
   * Sync Users
   */
  static async syncUsers(req, res) {
    try {
      await SyncService.syncUsersWithCloud();
      res.status(200).json({
        success: true,
        message: "Sync Users done",
      });
    } catch (error) {
      console.error("Error in syncUsers:", error);
      res.status(500).json({
        success: false,
        error: "Err while syncing Users.",
        details: error.message,
      });
    }
  }

  static async syncTags(req, res) {
    try {
      await SyncService.syncTagsWithCloud();
      res.status(200).json({
        success: true,
        message: "Sync Tags done",
      });
    } catch (error) {
      console.error("Error in syncTags:", error);
      res.status(500).json({
        success: false,
        error: "Err while syncing Tags.",
        details: error.message,
      });
    }
  }
}

module.exports = SyncController;
