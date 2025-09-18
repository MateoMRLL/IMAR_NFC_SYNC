const NfcService = require("../services/nfcService");

class NfcController {
  static async scan(req, res) {
    try {
      const result = await NfcService.scanNfc(req.body);

      if (result.status === "new_card") {
        return res.status(200).json({
          success: true,
          message: result.message,
          sync: result.sync_status,
          uid: result.uid,
        });
      }

      if (result.status === "unassigned_card") {
        return res.status(200).json({
          success: false,
          message: result.message,
          sync: result.sync_status,
          uid: result.uid,
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
        sync: result.sync_status,
        uid: result.uid,
      });
    } catch (error) {
      console.error("Error in scan:", error);

      if (error.message === "Missing nfc_uid") {
        return res.status(400).json({ error: error.message });
      }

      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Error processing NFC scan" });
    }
  }

   static async getLogs(req, res) {
    try {
      const logs = await NfcService.getRecentScans();
      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
   }
  
}

module.exports = NfcController;
