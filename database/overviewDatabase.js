const mysql = require("mysql2/promise");
const path = require("path");
const dotenv = require("dotenv");

const pathenv = path.join(__dirname, "../.mysql_setup.env ");
console.log(pathenv);
dotenv.config({ path: pathenv });

async function showDatabaseOverview() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Connected to database successfully!\n");

    // Show all tables
    const [tables] = await connection.execute("SHOW TABLES");

    if (tables.length === 0) {
      console.log("No tables found in the database.");
      return;
    }

    console.log(`Database contains ${tables.length} tables:`);
    console.log("=====================================\n");

    for (let i = 0; i < tables.length; i++) {
      const tableName = Object.values(tables[i])[0];
      console.log(`${i + 1}. ${tableName}`);

      // Get table structure
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);

      console.log("   Properties:");
      columns.forEach((col) => {
        let info = `   - ${col.Field}: ${col.Type}`;
        if (col.Key === "PRI") info += " (PRIMARY KEY)";
        if (col.Key === "UNI") info += " (UNIQUE)";
        if (col.Key === "MUL") info += " (INDEX)";
        if (col.Null === "NO") info += " NOT NULL";
        if (col.Default !== null) info += ` DEFAULT: ${col.Default}`;
        if (col.Extra) info += ` ${col.Extra}`;
        console.log(info);
      });

      // Get row count
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${tableName}`
      );
      console.log(`   Records: ${countResult[0].count}`);
      console.log("");
    }
  } catch (error) {
    console.error("Error connecting to database:", error.message);
  } finally {
    await connection.end();
  }
}

showDatabaseOverview().catch(console.error);
