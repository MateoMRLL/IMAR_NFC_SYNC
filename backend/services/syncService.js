const UserModel = require("../models/userModel");
const TagModel = require("../models/tagModel");
const { fetchFromPHP } = require("../utils/dataGetter");
const { forwardToPHP } = require("../utils/dataSender");
const { getLastsync, updateLastsync } = require("../models/syncModel");

async function syncUsersWithCloud(cloudUsers) {
  if (!cloudUsers || cloudUsers.length === 0) {
    console.log("No users to synchronize");
    return { updated: 0, deleted: 0 };
  }

  const cloudMap = {};
  (Array.isArray(cloudUsers) ? cloudUsers : [cloudUsers]).forEach((u) => {
    if (u.local_uuid) cloudMap[u.local_uuid] = u;
  });

  const localUsers = await UserModel.getUsers();

  let updated = 0;
  let deleted = 0;

  for (const local of localUsers) {
    const cloudUser = cloudMap[local.local_uuid];

    if (cloudUser) {
      await UserModel.upsertUser(local.local_uuid, cloudUser);
      updated++;
    } else {
      await UserModel.deleteLocalUser(local.local_uuid);
      deleted++;
    }
  }

  console.log(
    `Sync Service: ${updated} updated, ${deleted} deleted, total cloud users ${cloudUsers.length}`
  );
  return { updated, deleted };
}

/**
 * Synchronisation globale (toutes les entités)
 */
async function syncAll() {
  await syncUsersWithCloud();
}

module.exports = {
  syncUsersWithCloud,
  syncAll,
};
