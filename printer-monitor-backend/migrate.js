const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log("Adding new columns to printer_status...");
    await connection.execute('ALTER TABLE printer_status ADD COLUMN uptime VARCHAR(100) DEFAULT NULL;');
    await connection.execute('ALTER TABLE printer_status ADD COLUMN mac_address VARCHAR(50) DEFAULT NULL;');
    await connection.execute('ALTER TABLE printer_status ADD COLUMN drum_level VARCHAR(50) DEFAULT NULL;');
    await connection.execute('ALTER TABLE printer_status ADD COLUMN tray_levels VARCHAR(255) DEFAULT NULL;');

    console.log("Adding new columns to printer_logs...");
    await connection.execute('ALTER TABLE printer_logs ADD COLUMN uptime VARCHAR(100) DEFAULT NULL;');
    await connection.execute('ALTER TABLE printer_logs ADD COLUMN mac_address VARCHAR(50) DEFAULT NULL;');
    await connection.execute('ALTER TABLE printer_logs ADD COLUMN drum_level VARCHAR(50) DEFAULT NULL;');
    await connection.execute('ALTER TABLE printer_logs ADD COLUMN tray_levels VARCHAR(255) DEFAULT NULL;');
    
    console.log("Migration successful.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist, skipping...");
    } else {
      console.error("Migration failed:", err);
    }
  } finally {
    await connection.end();
  }
}

migrate();
