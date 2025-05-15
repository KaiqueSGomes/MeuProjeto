const mysql = require('mysql2/promise');
require('dotenv').config();

const db = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)  // se tiver a variável de ambiente (Railway)
  : mysql.createPool({                          // se não tiver, usa local
      host: 'localhost',
      user: 'root',
      password: 'Ka980548244@',
      database: 'dbQuizPex'
    });

module.exports = db;
