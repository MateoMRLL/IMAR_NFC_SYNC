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

module.exports = {
  getTagByUid,
  addTag,
  getAllTags,
};
