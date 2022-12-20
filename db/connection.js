const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'coding2023',
    database: 'employeeTracker_db'
});

db.connect();

module.exports = db;