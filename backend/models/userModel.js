const db = require("../config/database");

function getUsers() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        BIN_TO_UUID(id, 1) AS local_uuid,
        BIN_TO_UUID(cloud_id, 1) AS cloud_uuid,
        name, 
        email,
        sync_status,
        synced_at,
        created_at,
        updated_at
      FROM Users
      ORDER BY name
    `;
    db.query(sql, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function getUserByUuid(local_uuid) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        BIN_TO_UUID(id, 1) AS local_uuid,
        BIN_TO_UUID(cloud_id, 1) AS cloud_uuid,
        name, 
        email,
        sync_status,
        synced_at
      FROM Users 
      WHERE id = UUID_TO_BIN(?, 1)
      LIMIT 1
    `;
    db.query(sql, [local_uuid], (err, data) => {
      if (err) return reject(err);
      resolve(data[0] || null);
    });
  });
}

function getUserByCloudUuid(cloud_uuid) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        BIN_TO_UUID(id, 1) AS local_uuid,
        BIN_TO_UUID(cloud_id, 1) AS cloud_uuid,
        name, 
        email,
        sync_status,
        synced_at
      FROM Users 
      WHERE cloud_id = UUID_TO_BIN(?, 1)
    `;
    db.query(sql, [cloud_uuid], (err, data) => {
      if (err) reject(err);
      else resolve(data[0]);
    });
  });
}

function addUser(user) {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO Users (name, email, sync_status) VALUES (?, ?, 'pending')";
    db.query(sql, [user.name, user.email], (err) => {
      if (err) return reject(err);

      const getUserSql = `
        SELECT 
          BIN_TO_UUID(id, 1) AS local_uuid,
          name, 
          email,
          sync_status
        FROM Users 
        WHERE name = ? AND email = ?
        ORDER BY created_at DESC
        LIMIT 1
      `;
      db.query(getUserSql, [user.name, user.email], (err2, data) => {
        if (err2) reject(err2);
        else resolve(data[0]);
      });
    });
  });
}

function updateCloudId(local_uuid, cloud_uuid) {
  return new Promise((resolve, reject) => {
    let sql, values;

    if (cloud_uuid === null) {
      sql = `
        UPDATE Users 
        SET cloud_id = NULL, updated_at = NOW() 
        WHERE id = UUID_TO_BIN(?, 1)
      `;
      values = [local_uuid];
    } else {
      sql = `
        UPDATE Users 
        SET cloud_id = UUID_TO_BIN(?, 1), updated_at = NOW() 
        WHERE id = UUID_TO_BIN(?, 1)
      `;
      values = [cloud_uuid, local_uuid];
    }

    db.query(sql, values, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function updateSyncStatus(local_uuid, status) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE Users
      SET sync_status = ?, 
          synced_at = NOW(),
          updated_at = NOW()
      WHERE id = UUID_TO_BIN(?, 1)
    `;
    db.query(sql, [status, local_uuid], (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function deleteUserByUuid(local_uuid) {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM Users WHERE id = UUID_TO_BIN(?, 1)";
    db.query(sql, [local_uuid], (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        BIN_TO_UUID(id, 1) AS local_uuid,
        BIN_TO_UUID(cloud_id, 1) AS cloud_uuid,
        name, 
        email,
        sync_status,
        synced_at
      FROM Users 
      WHERE email = ?
    `;
    db.query(sql, [email], (err, data) => {
      if (err) reject(err);
      else resolve(data[0]);
    });
  });
}
function upsertAndCleanUser(cloudUsers) {
  console.log("test", cloudUsers);
  const cloudUsers = JSON.parse(jsonFromPhp);
  console.log("test2", cloudUsers)
  return new Promise((resolve, reject) => {
    if (!cloudUsers || cloudUsers.length === 0) return resolve({ updated: 0, deleted: 0 });

    const cloudMap = {};
    cloudUsers.forEach(u => {
      if (u.local_uuid) cloudMap[u.local_uuid] = u;
    });

    db.query("SELECT id, cloud_id FROM Users", (err, localUsers) => {
      if (err) return reject(err);

      let updated = 0;
      let deleted = 0;

      const promises = localUsers.map(local => {
        const cloudUser = cloudMap[local.id];
        if (cloudUser) {
          const sql = `
            UPDATE Users
            SET name = ?, email = ?, cloud_id = UUID_TO_BIN(?,1), updated_at = NOW()
            WHERE id = UUID_TO_BIN(?,1)
          `;
          const values = [cloudUser.name, cloudUser.email, cloudUser.cloud_uuid, local.id];
          return new Promise((res, rej) => {
            db.query(sql, values, (err) => {
              if (err) return rej(err);
              updated++;
              res();
            });
          });
        } else {
          const sql = "DELETE FROM Users WHERE id = UUID_TO_BIN(?,1)";
          return new Promise((res, rej) => {
            db.query(sql, [local.id], (err) => {
              if (err) return rej(err);
              deleted++;
              res();
            });
          });
        }
      });

      Promise.all(promises)
        .then(() => resolve({ updated, deleted }))
        .catch(reject);
    });
  });

}


   
  
module.exports = {
  getUsers,
  getUserByUuid,
  getUserByEmail,
  getUserByCloudUuid,
  addUser,
  updateCloudId,
  updateSyncStatus,
  deleteUserByUuid,
  upsertAndCleanUser,
};
