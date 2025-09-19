const UserModel = require("../models/userModel");
const TagModel = require("../models/tagModel");
const { fetchFromPHP } = require("../utils/dataGetter");
const { forwardToPHP } = require("../utils/dataSender");
const { getLastsync, updateLastsync } = require("../models/syncModel");

async function syncUsersWithCloud() {
  const lastSync = await getLastsync("users");
  console.log("Last sync timestamp:", lastSync);

  const cloudUsers = await fetchFromPHP("users", { updated_after: lastSync });
  console.log("Cloud users fetched:", cloudUsers.length);

  if (!cloudUsers || cloudUsers.length === 0) {
    console.log("No users to synchronize");
    return { updated: 0, deleted: 0, inserted: 0 };
  }

  // Map for quick lookup by local_uuid
  const cloudMap = {};
  (Array.isArray(cloudUsers) ? cloudUsers : [cloudUsers]).forEach((u) => {
    if (u.local_uuid) cloudMap[u.local_uuid] = u;
  });

  // Fetch all local users
  const localUsers = await UserModel.getUsers();
  console.log("Local users fetched:", localUsers.length);

  let updated = 0;
  let deleted = 0;
  let inserted = 0;

  // 1) Iterate through local users
  for (const local of localUsers) {
    const cloudUser = cloudMap[local.local_uuid];

    if (cloudUser) {
      console.log(`Updating local user ${local.local_uuid} with cloud data`);
      await UserModel.upsertUser(local.local_uuid, cloudUser);
      updated++;
    } else {
      console.log(
        `Deleting local user ${local.local_uuid} (not found in cloud)`
      );
      await UserModel.deleteLocalUser(local.local_uuid);
      deleted++;
    }
  }

  // 2) Insert new users from the cloud that don't exist locally
  const localMap = {};
  localUsers.forEach((u) => {
    if (u.local_uuid) localMap[u.local_uuid] = u;
  });

  for (const cloudUser of cloudUsers) {
    if (!localMap[cloudUser.local_uuid]) {
      console.log(`Inserting new user from cloud: ${cloudUser.local_uuid}`);
      await UserModel.upsertUser(cloudUser.local_uuid, cloudUser);
      inserted++;
    }
  }

  console.log(
    `Sync complete: ${updated} updated, ${deleted} deleted, ${inserted} inserted`
  );
  return { updated, deleted, inserted };
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
