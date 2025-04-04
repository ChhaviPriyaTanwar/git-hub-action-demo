const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

app.use(express.json());

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'mydb'
};

// Initialize database and table
async function initializeDatabase() {
  const connection = await mysql.createConnection({
    ...dbConfig,
    database: undefined // Connect without selecting database first
  });
  
  await connection.query('CREATE DATABASE IF NOT EXISTS mydb');
  await connection.query('USE mydb');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE
    )
  `);
  await connection.end();
}

// GET endpoint - fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query('SELECT * FROM users');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint - add a new user
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    await connection.end();
    res.status(201).json({ id: result.insertId, name, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();



// ------------- Working Code -------------------


// const express = require('express');
// const app = express();
// const port = 3000;

// app.get('/api', (req, res) => {
//   res.json({
//     message: 'Hello from Node.js API!',
//     status: 'success',
//     timestamp: new Date().toISOString()
//   });
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
