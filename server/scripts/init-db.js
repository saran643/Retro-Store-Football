/**
 * Database Initialization Script
 * Executes schema.sql and seed.sql onto MySQL
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function initDB() {
  console.log('Connecting to MySQL Server at', `${dbConfig.host}:${dbConfig.port}...`);
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Successfully connected to MySQL.');

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    console.log('Reading and executing schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('✓ Database schema created successfully.');

    console.log('Reading and executing seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log('✓ Database seeded with initial football products and categories.');

    // Verify row counts
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM `retro_store_db`.`categories`');
    const [products] = await connection.query('SELECT COUNT(*) as count FROM `retro_store_db`.`products`');
    const [variants] = await connection.query('SELECT COUNT(*) as count FROM `retro_store_db`.`product_variants`');
    const [users] = await connection.query('SELECT COUNT(*) as count FROM `retro_store_db`.`users`');

    console.log('\n--- RETRO STORE DATABASE STATUS ---');
    console.log(`Categories:       ${categories[0].count}`);
    console.log(`Products:         ${products[0].count}`);
    console.log(`Product Variants: ${variants[0].count}`);
    console.log(`Registered Users: ${users[0].count}`);
    console.log('------------------------------------\n');
    console.log('✓ Database setup completed successfully!');
  } catch (err) {
    console.error('✗ Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDB();
