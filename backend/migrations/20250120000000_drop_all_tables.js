exports.up = function(knex) {
  return knex.schema
    .dropTableIfExists('admins')
    .dropTableIfExists('settings')
    .dropTableIfExists('forms')
    .dropTableIfExists('form_responses')
    .dropTableIfExists('form_fields');
};

exports.down = function(knex) {
  // No down migration needed since we're dropping tables
  return Promise.resolve();
};
