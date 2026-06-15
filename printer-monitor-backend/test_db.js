const db = require('./config/db');

async function test() {
    const [rows] = await db.query('SELECT * FROM printer_status');
    console.log("PRINTER STATUS:", rows);
    
    const [logs] = await db.query('SELECT * FROM printer_logs LIMIT 10');
    console.log("PRINTER LOGS:", logs);
    
    process.exit(0);
}
test();
