const db = require("../config/database");

function logScan(uid, local_uuid) {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO ScanLogs (tag_id, user_id) 
      VALUES (?, UUID_TO_BIN(?,1))
    `;
    db.query(insertSql, [uid.toUpperCase(), local_uuid || null], (err) => {
      if (err) return reject(err);

      const getLogSql = `
        SELECT 
          id,
          tag_id,
          BIN_TO_UUID(user_id, 1) AS local_uuid,
          scanned_at
        FROM ScanLogs
        WHERE tag_id = ? AND user_id <=> UUID_TO_BIN(?,1)
        ORDER BY scanned_at DESC
        LIMIT 1
      `;
      db.query(
        getLogSql,
        [uid.toUpperCase(), local_uuid || null],
        (err2, data) => {
          if (err2) return reject(err2);
          resolve(data[0]);
        }
      );
    });
  });
}

function getRecentLogs() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        l.id,
        l.scanned_at,
        l.tag_id,
        BIN_TO_UUID(l.user_id, 1) AS local_uuid,
        u.name AS user_name
      FROM ScanLogs l
      LEFT JOIN Users u ON l.user_id = u.id
      ORDER BY l.scanned_at DESC
    `;
    db.query(sql, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

module.exports = {
  logScan,
  getRecentLogs,
};
