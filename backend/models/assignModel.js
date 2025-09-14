const db = require("../config/database");

function findAssignmentByTagId(uid) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT tag_id, BIN_TO_UUID(user_id,1) AS local_uuid 
      FROM TagAssignments 
      WHERE tag_id = ?
      LIMIT 1
    `;
    db.query(sql, [uid], (err, data) => {
      if (err) return reject(err);
      resolve(data[0] || null);
    });
  });
}

function createAssignment(user_ids) {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO TagAssignments (tag_id, user_id) VALUES (?, UUID_TO_BIN(?, 1))";
    db.query(sql, [user_ids.nfc_uid, user_ids.local_uuid], (err) => {
      if (err) return reject(err);

      const getUserSql = `
        SELECT 
          BIN_TO_UUID(user_id, 1) AS local_uuid,
          tag_id, 
          assigned_at
        FROM TagAssignments
        ORDER BY assigned_at DESC
        LIMIT 1
      `;
      db.query(getUserSql, [user_ids.local_uuid], (err2, data) => {
        if (err2) reject(err2);
        else resolve(data[0]);
      });
    });
  });
}

function deleteAssignment(tagId) {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM TagAssignments WHERE tag_id = ?";
    db.query(sql, [tagId], (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function findAssignmentsByUserId(userId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM TagAssignments WHERE user_id = ?";
    db.query(sql, [userId], (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

module.exports = {
  findAssignmentByTagId,
  createAssignment,
  deleteAssignment,
  findAssignmentsByUserId,
};
