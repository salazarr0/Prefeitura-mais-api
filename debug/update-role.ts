import { connection } from '../src/dbConnection';

async function run() {
  await connection('usuarios').where({ email: 'Robotica.com' }).update({ papel: 'funcionario' });
  const user = await connection('usuarios').where({ email: 'Robotica.com' }).first();
  console.log('User updated:', user);
  process.exit();
}
run();
