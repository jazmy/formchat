const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Clear existing entries
  await knex('admins').del();
  
  // Insert admin user
  await knex('admins').insert([
    {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10)
    }
  ]);
}; 