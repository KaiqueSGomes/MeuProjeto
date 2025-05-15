const mysql = require('mysql2/promise');

// Conecta usando a variável de ambiente DATABASE_URL
const pool = mysql.createPool(process.env.DATABASE_URL);

module.exports = pool;
