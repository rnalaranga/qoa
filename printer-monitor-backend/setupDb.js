const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    try {
        // Connect without a specific database first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        console.log("Connected to MySQL server. Creating database...");

        // Create Database
        await connection.query(`CREATE DATABASE IF NOT EXISTS printer_monitoring`);
        console.log("Database 'printer_monitoring' created or already exists.");

        // Use the new database
        await connection.query(`USE printer_monitoring`);

        console.log("Creating tables...");

        // Create printer_status table
        const createStatusTableQuery = `
            CREATE TABLE IF NOT EXISTS printer_status (
                id INT AUTO_INCREMENT PRIMARY KEY,
                qoa_num VARCHAR(50),
                ip_address VARCHAR(50) UNIQUE,
                model VARCHAR(100),
                toner_level VARCHAR(20),
                pages_printed VARCHAR(50),
                printer_status VARCHAR(50),
                error_status VARCHAR(255),
                online_status VARCHAR(20),
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createStatusTableQuery);
        console.log("Table 'printer_status' created.");

        // Create printer_logs table
        const createLogsTableQuery = `
            CREATE TABLE IF NOT EXISTS printer_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_address VARCHAR(50),
                toner_level VARCHAR(20),
                pages_printed VARCHAR(50),
                printer_status VARCHAR(50),
                error_status VARCHAR(255),
                online_status VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createLogsTableQuery);
        console.log("Table 'printer_logs' created.");

        console.log("Database setup completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error setting up database:", error);
        process.exit(1);
    }
}

setupDatabase();
