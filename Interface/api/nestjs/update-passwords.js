const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'avenir_bank_postgres',
});

async function updatePasswords() {
  try {
    const hash = '$2b$10$9qog/CuftPpSHFHVFh4GK.cU11l/hak0ZfyU2udoZuyPjOLOCCMJS';

    const result = await pool.query(
      `UPDATE users SET password_hash = $1
       WHERE email IN ('client@avenir-bank.fr', 'advisor@avenir-bank.fr', 'director@avenir-bank.fr')`,
      [hash]
    );

    console.log(`✅ Updated ${result.rowCount} users with new password hash`);
    console.log('Password: password123');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updatePasswords();
