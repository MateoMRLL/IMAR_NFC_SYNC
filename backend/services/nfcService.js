const TagModel = require("../models/tagModel");
const AssignModel = require("../models/assignModel");
const UserModel = require("../models/userModel");
const ScanLogModel = require("../models/logsModel");
const { forwardToPHP } = require("../utils/dataSender");
const { fetchFromPHP } = require("../utils/dataGetter");

async function scanNfc(scanData) {
  const { nfc_uid } = scanData;
  if (!nfc_uid) {
    throw new Error("Missing nfc_uid");
  }

  let tag = await TagModel.getTagByUid(nfc_uid);

  if (!tag) {
    tag = await TagModel.addTag(nfc_uid);
    try {
      const cloudTag = await forwardToPHP("tag", { uid: nfc_uid });

      return {
        ...tag,
        sync_status: "synced",
        synced: true,
        message: "New card registered synced in local and cloud.",
        status: "new_card",
      };
    } catch (err) {
      console.error("Tag sync failed:", err.message);

      return {
        ...tag,
        sync_status: "failed",
        synced: false,
        sync_error: err.message,
        message: "New card registered locally.",
        status: "new_card",
      };
    }
  }

  const localAssignment = await AssignModel.findAssignmentByTagId(tag.uid);

  if (!localAssignment) {
    return {
      ...tag,
      message: "Card is not assigned to any user. Please register it.",
      status: "unassigned_card",
    };
  }
  const localUser = await UserModel.getUserByUuid(localAssignment.local_uuid);

  if (!localUser) {
    throw new Error("User not found");
  }

  logs = await ScanLogModel.logScan(nfc_uid, localAssignment.local_uuid);
  try {
    const cloudLogs = await forwardToPHP("scan", {
      uid: nfc_uid,
      cloud_uuid: localUser.cloud_uuid,
      timestamp: logs.scanned_at,
    });

    logs = {
      ...logs,
      sync_status: "synced",
      synced: true,
      cloud_response: cloudLogs,
    };
  } catch (err) {
    console.error("Scan log sync failed:", err.message);

    logs = {
      ...logs,
      sync_status: "failed",
      synced: false,
      sync_error: err.message,
    };
  }

  return {
    ...tag,
    message: `Welcome, ${localUser.name}!`,
    status: "existing_card",
    scan_log: logs, // retourne le log avec son statut cloud
  };
}

async function getRecentScans() {
  try {

    const [localScans, cloudScans] = await Promise.all([
      ScanLogModel.getRecentLogs(),
      fetchFromPHP("logs"),
    ]);

    return {
      local: localScans,
      cloud: cloudScans,
    };
  } catch (err) {
    console.error("Fetching recent scans failed:", err.message);
    return {
      local: [],
      cloud: [],
    };
  }
}


module.exports = {
  scanNfc,
  getRecentScans,
};
