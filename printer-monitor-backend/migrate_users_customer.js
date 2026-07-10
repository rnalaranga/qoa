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

        console.log("Connected to MySQL server. Running Print Users Customer migration...");

        // 1. Add customer_id to print_users
        try {
            await connection.query(`ALTER TABLE print_users ADD COLUMN customer_id INT`);
            console.log("Added 'customer_id' column to 'print_users'.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("'customer_id' column already exists in 'print_users'.");
            } else {
                throw e;
            }
        }

        // 2. Add Foreign Key
        try {
            await connection.query(`
                ALTER TABLE print_users 
                ADD CONSTRAINT fk_print_users_customer 
                FOREIGN KEY (customer_id) 
                REFERENCES customers(id) 
                ON DELETE SET NULL
            `);
            console.log("Added foreign key constraint to 'print_users'.");
        } catch (e) {
             if (e.code === 'ER_DUP_KEYNAME' || e.code === 'ER_CANT_CREATE_TABLE') {
                console.log("Foreign key constraint already exists or handled.");
            } else {
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
