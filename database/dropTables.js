const mysql = require("mysql2/promise");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.mysql_setup.env ") });

async function dropAllTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("Database connection successful!");

    await connection.execute("SET FOREIGN_KEY_CHECKS = 0;");
    console.log("Foreign key checks disabled.");

    const [tables] = await connection.execute("SHOW TABLES");

    if (tables.length === 0) {
      console.log("No tables found in the database.");
      return;
    }

    console.log(`\nFound ${tables.length} tables to drop:`);
    tables.forEach((table) => {
      console.log(`- ${Object.values(table)[0]}`);
    });

    console.log("\nDropping all tables...");

    for (const table of tables) {
      const tableName = Object.values(table)[0];
      try {
        await connection.execute(`DROP TABLE ${tableName};`);
        console.log(`Table "${tableName}" dropped successfully.`);
      } catch (error) {
        console.error(`Error dropping table "${tableName}":`, error.message);
      }
    }

    await connection.execute("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("\nForeign key checks re-enabled.");

    const [remainingTables] = await connection.execute("SHOW TABLES");
    if (remainingTables.length === 0) {
      console.log("All tables have been successfully dropped!");
    } else {
      console.log("Some tables were not dropped:");
      remainingTables.forEach((table) => {
        console.log(`- ${Object.values(table)[0]}`);
      });
    }
  } catch (error) {
    console.error("Error dropping tables:", error.message);
    console.error("Details:", error);
  } finally {
    await connection.end();
    console.log("Connection closed.");
  }
}
dropAllTables().catch(console.error);
