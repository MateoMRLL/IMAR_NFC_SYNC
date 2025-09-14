const UserModel = require("../models/userModel");
const { forwardToPHP } = require("../utils/dataSender");
const { fetchFromPHP } = require("../utils/dataGetter");

async function registerUser(userData) {
  if (!userData.name || !userData.email) {
    throw new Error("Missing required fields");
  }

  const localUser = await UserModel.addUser(userData);
  console.log("Local user created:", localUser);

  try {
    const cloudUser = await forwardToPHP("user", {
      name: localUser.name,
      email: localUser.email,
      local_uuid: localUser.local_uuid,
    });
    console.log("Cloud user synced:", cloudUser);

    const cloudUuid = cloudUser?.cloud_uuid ?? null;

    if (cloudUuid) {
      await UserModel.updateCloudId(localUser.local_uuid, cloudUuid);
      await UserModel.updateSyncStatus(localUser.local_uuid, "synced");

      console.log(
        `Local user uuid ${localUser.local_uuid} updated with cloud_uuid ${cloudUuid} and status synced`
      );
    }

    return {
      ...localUser,
      cloud_uuid: cloudUuid,
      sync_status: "synced",
      synced: true,
    };
  } catch (err) {
    console.error("local_id Sync failed:", err.message);

    await UserModel.updateSyncStatus(localUser.local_uuid, "failed");

    return {
      ...localUser,
      cloud_uuid: null,
      sync_status: "failed",
      synced: false,
      sync_error: err.message,
    };
  }
}

async function getAllUsers() {
  try {
    const [localUsers, cloudUsers] = await Promise.all([
      UserModel.getUsers(),
      fetchFromPHP("users"),
    ]);

    return {
      local: localUsers,
      cloud: cloudUsers,
    };
  } catch (err) {
    console.error("fetching failed:", err.message);
  }
}

async function getUserFromCloud(cloud_uuid) {
  try {
    const cloudUser = await fetchFromPHP("user", {
      uuid: cloud_uuid,
    });

    if (!cloudUser)
      return {
        local: null,
        cloud: null,
      };

    const localUser = await UserModel.getUserByCloudUuid(cloud_uuid);

    return {
      local: localUser,
      cloud: cloudUser,
    };
  } catch (err) {
    console.error("fetching user failed:", err.message);
  }
}

module.exports = {
  registerUser,
  getAllUsers,
  getUserFromCloud,
};
