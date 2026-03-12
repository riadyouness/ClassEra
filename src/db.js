const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 20,    
  waitForConnections: true,   
  queueLimit: 0,           
  enableKeepAlive: true,     
  keepAliveInitialDelay: 10000,
  charset: 'utf8mb4'
});

db.getConnection((err) => {
  console.log({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  if (err) {
    console.error("❌ MySQL connection failed");
    console.error(err);
    return;
  }
  console.log("✅ MySQL connected");
});

module.exports = db;