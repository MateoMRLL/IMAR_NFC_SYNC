const mysql = require("mysql2/promise");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.mysql_setup.env") });

async function createMinimalTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("Database connection successful!");

    const createTagsSQL = `
      CREATE TABLE IF NOT EXISTS Tags (
        uid VARCHAR(32) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
        synced_at TIMESTAMP NULL DEFAULT NULL,
      );`;
    await connection.execute(createTagsSQL);
    console.log(' Table "Tags" created');

    const createUsersSQL = `
    CREATE TABLE IF NOT EXISTS Users (
      id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)),
      cloud_id BINARY(16) NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
      synced_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_cloud_id (cloud_id),
      INDEX idx_email (email),
      INDEX idx_sync_status (sync_status)
);
`;
    await connection.execute(createUsersSQL);
    console.log(' Table "Users" created');

    const createAssignmentsSQL = `
      CREATE TABLE IF NOT EXISTS TagAssignments (
        tag_id VARCHAR(32) NOT NULL,
        user_id BINARY(16) NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
        synced_at TIMESTAMP NULL DEFAULT NULL,

        PRIMARY KEY (tag_id, user_id),
        FOREIGN KEY (tag_id) REFERENCES Tags(uid) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  );
`;
    await connection.execute(createAssignmentsSQL);
    console.log('Table "TagAssignments" created');

    const createScanLogsSQL = `
      CREATE TABLE IF NOT EXISTS ScanLogs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        tag_id VARCHAR(32) NOT NULL,
        user_id BINARY(16) NULL,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
        FOREIGN KEY (tag_id) REFERENCES Tags(uid) ON DELETE CASCADE,
        INDEX idx_tag_id (tag_id),
        INDEX idx_user_id (user_id)
  );
  `;
    await connection.execute(createScanLogsSQL);
    console.log(' Table "ScanLogs" created');

    const createLastSyncSQL = `
      CREATE TABLE IF NOT EXISTS Sync (
        table_name VARCHAR(100) PRIMARY KEY,
        last_sync DATETIME
  );
  `;
    await connection.execute(createLastSyncSQL);
    console.log(' Table "Sync" created');

    const [tables] = await connection.execute("SHOW TABLES");
    console.log("\n Tables in database:");
    tables.forEach((table) => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log("\n Minimal NFC system ready!");
  } catch (error) {
    console.error(" Error:", error.message);
  } finally {
    await connection.end();
  }
}

createMinimalTables().catch(console.error);
