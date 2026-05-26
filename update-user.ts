import { connection } from './src/dbConnection';
import bcrypt from 'bcryptjs';

async function run() {
  const newHash = await bcrypt.hash('rb123', 10);
  await connection('usuarios').where({ email: 'Robotica.com' }).update({ senha_hash: newHash });
  
  const user = await connection('usuarios').where({ email: 'Robotica.com' }).first();
  console.log('User updated:', user);
  
  const isMatch = await bcrypt.compare('rb123', user.senha_hash);
  console.log('Does rb123 match now?', isMatch);
  process.exit();
}
run();
