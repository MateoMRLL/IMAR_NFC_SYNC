const db = require("../config/database");


function getLastsync(tableName) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT last_sync FROM Sync WHERE table_name = ?`;
    db.query(sql, [tableName], (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
        resolve(results[0].last_sync);
      } else {
        resolve("1970-01-01 00:00:00");
      }
    });
  });
}

function updateLastsync(tableName) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Sync (table_name, last_sync)
      VALUES (?, NOW())
      ON DUPLICATE KEY UPDATE last_sync = NOW()
    `;
    db.query(sql, [tableName], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

module.exports = {
 getLastsync,
 updatelastSync, 
};
