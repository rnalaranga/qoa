const mysql = require('mysql2/promise');
require('dotenv').config();

async function inject() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await connection.execute(`
      UPDATE printer_status 
      SET 
        uptime = '42d 15h',
        mac_address = '00:1B:44:11:3A:B7',
        drum_level = '84%',
        tray_levels = '{"tray1": 75, "tray2": 15}'
      WHERE ip_address = '192.168.1.100'
    `);
    
    await connection.execute(`
      UPDATE printer_status 
      SET 
        uptime = '10d 2h',
        mac_address = '00:1A:2B:3C:4D:5E',
        drum_level = '5%',
        tray_levels = '{"tray1": 0, "tray2": 100}'
      WHERE ip_address = '192.168.1.101'
    `);
    console.log("Injected dummy data successfully.");
  } catch (err) {
    console.error("Injection failed:", err);
  } finally {
    await connection.end();
  }
}

inject();
