const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'avenir_bank_postgres',
});

async function testLogin() {
  try {
    // 1. Chercher l'utilisateur par email
    console.log('1. Searching for user with email: client@avenir-bank.fr');
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['client@avenir-bank.fr']
    );

    if (result.rows.length === 0) {
      console.error('❌ User not found!');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified,
    });

    // 2. Vérifier le mot de passe
    console.log('\n2. Checking password...');
    const isPasswordValid = await bcrypt.compare('password123', user.password_hash);

    if (isPasswordValid) {
      console.log('✅ Password is valid!');
    } else {
      console.log('❌ Password is invalid!');
    }

    // 3. Vérifier si banni
    console.log('\n3. Checking if user is banned...');
    if (user.is_banned) {
      console.log('❌ User is banned!');
    } else {
      console.log('✅ User is not banned');
    }

    console.log('\n✅ All checks passed - login should work!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testLogin();
