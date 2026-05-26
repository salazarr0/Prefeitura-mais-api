import bcrypt from 'bcryptjs';

async function run() {
  const isMatch = await bcrypt.compare('rb123', '$2b$10$aqlqTQOJMIOgQXQ9xo4gs.6P7A/5jEDKhYuEtBCu2DgM3ATgOt6QO');
  console.log('Does rb123 match?', isMatch);
  process.exit();
}
run();
