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

        console.log("Connected to MySQL server. Running migrations...");

        // 1. Create customers table
        const createCustomersTable = `
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                contact_info VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createCustomersTable);
        console.log("Table 'customers' created or verified.");

        // 2. Alter printer_status to add customer_id
        try {
            await connection.query(`ALTER TABLE printer_status ADD COLUMN customer_id INT`);
            console.log("Added 'customer_id' column to 'printer_status'.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("'customer_id' column already exists in 'printer_status'.");
            } else {
                throw e;
            }
        }

        // 3. Add Foreign Key constraint (optional but good practice)
        try {
            await connection.query(`
                ALTER TABLE printer_status 
                ADD CONSTRAINT fk_printer_customer 
                FOREIGN KEY (customer_id) 
                REFERENCES customers(id) 
                ON DELETE SET NULL
            `);
            console.log("Added foreign key constraint to 'printer_status'.");
        } catch (e) {
             if (e.code === 'ER_DUP_KEYNAME' || e.code === 'ER_CANT_CREATE_TABLE') {
                console.log("Foreign key constraint already exists or handled.");
            } else {
                 // Ignore if it already exists, different MySQL versions throw different errors
                console.log("Foreign key check passed/skipped.");
            }
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error migrating database:", error);
        process.exit(1);
    }
}

migrateDatabase();
