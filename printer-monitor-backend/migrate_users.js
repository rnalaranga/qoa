const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: 'printer_monitoring'
        });

        console.log("Connected to MySQL server. Running User Management migrations...");

        // 1. Create print_users table
        const createPrintUsersTable = `
            CREATE TABLE IF NOT EXISTS print_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                pin_code VARCHAR(10) NOT NULL UNIQUE,
                monthly_quota INT DEFAULT 0,
                color_quota INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createPrintUsersTable);
        console.log("Table 'print_users' created or verified.");

        // 2. Create user_print_logs table
        const createUserLogsTable = `
            CREATE TABLE IF NOT EXISTS user_print_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                bw_prints INT DEFAULT 0,
                color_prints INT DEFAULT 0,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES print_users(id) ON DELETE CASCADE
            )
        `;
        await connection.query(createUserLogsTable);
        console.log("Table 'user_print_logs' created or verified.");

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error migrating database:", error);
        process.exit(1);
    }
}

migrateDatabase();
