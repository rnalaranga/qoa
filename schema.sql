CREATE DATABASE IF NOT EXISTS printer_monitoring;

USE printer_monitoring;

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
);

CREATE TABLE IF NOT EXISTS printer_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(50),
    toner_level VARCHAR(20),
    pages_printed VARCHAR(50),
    printer_status VARCHAR(50),
    error_status VARCHAR(255),
    online_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
