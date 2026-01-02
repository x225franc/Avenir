const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);

  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL to update users:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email IN ('client@avenir-bank.fr', 'advisor@avenir-bank.fr', 'director@avenir-bank.fr');`);
}

generateHash();
