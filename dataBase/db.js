const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'metro.proxy.rlwy.net',
  user: 'root',
  password: 'BpVAlDabYpOzJLtEbKTWPAXuVBbUlIVR',
  port: 14111,
  database: 'railway',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = db;
