import { connection } from '../src/dbConnection';

async function run() {
  const users = await connection('usuarios').select();
  console.log('All users:', users);
  process.exit();
}
run();
