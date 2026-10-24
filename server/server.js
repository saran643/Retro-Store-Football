const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to MySQL database: retro_store_db');
    connection.release();

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log('             RETRO STORE BACKEND SERVER             ');
      console.log('          "THE BEAUTIFUL GAME. FOREVER."            ');
      console.log('====================================================');
      console.log(`Server running live on: http://localhost:${PORT}`);
      console.log(`Health check:           http://localhost:${PORT}/api/health`);
      console.log(`Products API:           http://localhost:${PORT}/api/products`);
      console.log(`Categories API:         http://localhost:${PORT}/api/categories`);
      console.log(`Environment:            ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================\n');
    });
  } catch (err) {
    console.error('✗ Failed to connect to MySQL database:', err.message);
    console.error('Please verify MySQL is running on port 3306 and run: node server/scripts/init-db.js');
    process.exit(1);
  }
}

startServer();
