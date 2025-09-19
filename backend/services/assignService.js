const AssignModel = require("../models/assignModel");
const TagModel = require("../models/tagModel");
const UserModel = require("../models/userModel");
const { forwardToPHP } = require("../utils/dataSender");

async function assign(userData) {
  if (!userData.nfc_uid || !userData.email) {
    throw new Error("Missing required fields");
  }

  const tagRecord = await TagModel.getTagByUid(userData.nfc_uid);
  if (!tagRecord) {
    throw new Error("Tag not found");
  }

  const userRecord = await UserModel.getUserByEmail(userData.email);
  if (!userRecord) {
    throw new Error("User not found");
  }

  const existing = await AssignModel.findAssignmentByTagId(tagRecord.uid);
  if (existing) {
    throw new Error("Tag already assigned");
  }

  const user_ids = {
    local_uuid: userRecord.local_uuid,
    nfc_uid: tagRecord.uid,
  };
  const localAssignment = await AssignModel.createAssignment(user_ids);

  try {
    const cloudAssignment = await forwardToPHP("assign", {
      name: userRecord.name,
      email: userRecord.email,
      cloud_uuid: userRecord.cloud_uuid,
      nfc_uid: tagRecord.uid,
    });

    console.log("Cloud assignment synced:", cloudAssignment);

    return {
      ...localAssignment,
      cloud_uuid: cloudAssignment?.cloud_uuid ?? null,
      sync_status: "synced",
      synced: true,
    };
  } catch (err) {
    console.error("Assignment sync failed:", err.message);

    return {
      ...localAssignment,
      cloud_uuid: null,
      sync_status: "failed",
      synced: false,
      sync_error: err.message,
    };
  }
}

async function unassignTag(tagId) {
  const existing = await AssignModel.findAssignmentByTagId(tagId);
  if (!existing) {
    throw new Error("Tag not assigned");
  }

  return await AssignModel.deleteAssignment(tagId);
}

async function isTagAssigned(tagData) {
  if (!tagData.tagId) {
    throw new Error("Missing required field");
  }
  const existing = await AssignModel.findAssignmentByTagId(tagRecord.uid);
  return !!existing;
}

module.exports = {
  assign,
  unassignTag,
  isTagAssigned,
};
