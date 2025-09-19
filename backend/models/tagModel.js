const db = require("../config/database");

function getTagByUid(uid) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT uid FROM Tags WHERE uid = ?";
    db.query(sql, [uid.toUpperCase()], (err, data) => {
      if (err) reject(err);
      else resolve(data[0]);
    });
  });
}

function getAllTags() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Tags";
    db.query(sql, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function addTag(uid) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO Tags (uid) VALUES (?)";
    db.query(sql, [uid.toUpperCase()], (err) => {
      if (err) return reject(err);

      const getTagSql = `
        SELECT *
        FROM Tags 
        ORDER BY created_at DESC
        LIMIT 1
      `;
      db.query(getTagSql, (err2, data) => {
        if (err2) reject(err2);
        else resolve(data[0]);
      });
    });
  });
}

function deleteTagByUid(uid) {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM Tags WHERE uid = ?";
    db.query(sql, [uid.toUpperCase()], (err, data) => {
      if (err) reject(err);
      else resolve(data[0]);
    });
  });
}
function upsertTagByUid(uid, tagData) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Tags (
        uid, sync_status, synced_at, created_at, updated_at
      )
      VALUES (
        ?,'synced', NOW(), NOW(), NOW()
      )
      ON DUPLICATE KEY UPDATE
        sync_status = 'synced',
        synced_at = NOW(),
        updated_at = NOW()
    `;

    const values = [
      uid.toUpperCase(), // uid
    ];

    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

module.exports = {
  getTagByUid,
  addTag,
  getAllTags,
  deleteTagByUid,
  upsertTagByUid,
};
