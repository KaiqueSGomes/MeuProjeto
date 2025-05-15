const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Ka980548244@',
  database: 'dbQuizPex'
});

module.exports = db;
