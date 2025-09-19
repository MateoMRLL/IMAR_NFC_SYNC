const UserModel = require("../models/userModel");
const TagModel = require("../models/tagModel");
const { fetchFromPHP } = require("../utils/dataGetter");
const { forwardToPHP } = require("../utils/dataSender");
const { getLastsync, updateLastsync } = require("../models/syncModel");

async function syncUsers() {
  try {
    const lastSync = await getLastsync("users");
    const cloudUsers = await fetchFromPHP("users", { updated_after: lastSync });
    if (!cloudUsers || cloudUsers.length === 0) {
      console.log("No users to synchronize");
      return;
    }

   for (const user of cloudUsers) {
    console.log(user);
      await UserModel.upsertAndCleanUser(user);
    }

    //await updateLastSync("Users");
    console.log(`Sync OK: ${cloudUsers.length} users`);
  } catch (err) {
    console.error("Sync failed:", err.message);
    throw err;
  }
}


/**
 * Synchronisation globale (toutes les entités)
 */
async function syncAll() {
  await syncUsers();
}

module.exports = {
  syncUsers,
  syncAll,
};
