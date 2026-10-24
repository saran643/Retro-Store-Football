/**
 * RETRO STORE - Administrator Account Creation Script
 * Usage:
 *   node scripts/create-admin.js "Admin Name" "admin@example.com" "SecurePassword123" "+91 9876543210"
 * Or interactive/prompted fallback if arguments are omitted.
 */
const path = require('path');
const readline = require('readline');

// Enable resolving modules from server/node_modules
const serverNodeModules = path.join(__dirname, '../server/node_modules');
if (!module.paths.includes(serverNodeModules)) {
  module.paths.unshift(serverNodeModules);
}

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'retro_store_db'
};

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function createAdmin() {
  console.log('====================================================');
  console.log('       RETRO STORE - CREATE ADMINISTRATOR           ');
  console.log('====================================================\n');

  let name = process.argv[2];
  let email = process.argv[3];
  let password = process.argv[4];
  let phone = process.argv[5] || '+91 9876543210';

  if (!email || !password) {
    if (!name) name = await askQuestion('Enter Admin Full Name (e.g. Head of Football Operations): ');
    if (!email) email = await askQuestion('Enter Admin Email Address: ');
    if (!password) password = await askQuestion('Enter Secure Password (min 8 chars): ');
  }

  name = name || 'Store Administrator';

  if (!email || !email.includes('@')) {
    console.error('Error: Please provide a valid email address.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log(`Connecting to database ${dbConfig.database}...`);

    // Check if user already exists
    const [existing] = await connection.query('SELECT user_id, email, role FROM users WHERE email = ?', [email]);
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    if (existing.length > 0) {
      // Update existing user to admin
      await connection.query(
        'UPDATE users SET full_name = ?, password_hash = ?, role = "admin", status = "active", updated_at = NOW() WHERE email = ?',
        [name, passwordHash, email]
      );
      console.log(`\n✓ Success: Existing user "${email}" has been upgraded to Administrator role with new password.`);
    } else {
      // Insert new admin
      const [result] = await connection.query(
        'INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, "admin", "active")',
        [name, email, phone, passwordHash]
      );
      console.log(`\n✓ Success: Administrator account created! ID: ${result.insertId}`);
    }

    console.log(`Email:    ${email}`);
    console.log(`Role:     admin`);
    console.log(`Login at: http://localhost:5173/admin/login\n`);
    await connection.end();
  } catch (err) {
    console.error('✗ Failed to create administrator:', err.message);
    process.exit(1);
  }
}

createAdmin();
