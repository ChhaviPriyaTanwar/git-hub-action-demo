const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mydb',
  port: process.env.DB_PORT || 3306
};

// Existing GET endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Hello from Node.js API!',
    timestamp: new Date().toISOString()
  });
});

// New POST endpoint to add data
app.post('/api/add', async (req, res) => {
  try {
    const { name, value } = req.body;
    
    if (!name || !value) {
      return res.status(400).json({ error: 'Name and value are required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO items (name, value) VALUES (?, ?)',
      [name, value]
    );
    await connection.end();

    res.status(201).json({ message: 'Item added successfully', name, value });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Initialize database
async function initializeDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      value VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.end();
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  initializeDatabase().catch(console.error);
});



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