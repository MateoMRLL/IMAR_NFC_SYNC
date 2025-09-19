const UserModel = require("../models/userModel");
const TagModel = require("../models/tagModel");
const { fetchFromPHP } = require("../utils/dataGetter");
const SyncModel = require("../models/syncModel");

async function syncUsersWithCloud() {
  const lastSync = await SyncModel.getLastsync("users");
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
  await SyncModel.updateLastsync("users");
  console.log(
    `Sync complete: ${updated} updated, ${deleted} deleted, ${inserted} inserted`
  );
  return { updated, deleted, inserted };
}
async function syncTagsWithCloud() {
  // Get the timestamp of the last synchronization
  const lastSync = await SyncModel.getLastsync("users");
  console.log("Last sync timestamp:", lastSync);

  // Fetch updated tags from the cloud
  const cloudTags = await fetchFromPHP("tags", { updated_after: lastSync });
  console.log("Cloud tags fetched:", cloudTags.length);

  if (!cloudTags || cloudTags.length === 0) {
    console.log("No tags to synchronize");
    return { updated: 0, deleted: 0, inserted: 0 };
  }

  // Map for fast access by UID
  const cloudMap = {};
  (Array.isArray(cloudTags) ? cloudTags : [cloudTags]).forEach((t) => {
    if (t.uid) cloudMap[t.uid] = t;
  });

  // Fetch all local tags
  const localTags = await TagModel.getAllTags();
  console.log("Local tags fetched:", localTags.length);

  let updated = 0;
  let deleted = 0;
  let inserted = 0;

  //Update or delete local tags
  for (const local of localTags) {
    const cloudTag = cloudMap[local.uid];

    if (cloudTag) {
      console.log(`Updating local tag ${local.uid} with cloud data`);
      await TagModel.upsertTagByUid(local.uid, cloudTag);
      updated++;
    } else {
      console.log(`Deleting local tag ${local.uid} (not found in cloud)`);
      await TagModel.deleteTagByUid(local.uid);
      deleted++;
    }
  }

  //  Insert cloud tags that do not exist locally
  const localMap = {};
  localTags.forEach((t) => {
    if (t.uid) localMap[t.uid] = t;
  });

  for (const cloudTag of cloudTags) {
    if (!localMap[cloudTag.uid]) {
      console.log(`Inserting new tag from cloud: ${cloudTag.uid}`);
      await TagModel.upsertTagByUid(cloudTag.uid, cloudTag);
      inserted++;
    }
  }

  // Update the last sync timestamp
  await SyncModel.updateLastSync("tags");
  console.log(
    `Tag sync complete: ${updated} updated, ${deleted} deleted, ${inserted} inserted`
  );

  return { updated, deleted, inserted };
}

//Global Sync

async function syncAll() {
  await syncUsersWithCloud();
  await syncTagsWithCloud();
}

module.exports = {
  syncUsersWithCloud,
  syncTagsWithCloud,
  syncAll,
};
