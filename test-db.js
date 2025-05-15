// test-db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testarConexao() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Ka980548244@',
      database: 'dbQuizPex'
    });

    const [rows] = await db.query('SELECT * FROM perguntas');
    console.log('Conectado! Resultado:', rows);
    await db.end();
  } catch (err) {
    console.error('Erro ao conectar:', err.message);
  }
}

testarConexao();
