exports.up = function(knex) {
  return knex.schema
    // First drop all existing tables
    .dropTableIfExists('responses')
    .dropTableIfExists('prompts')
    .dropTableIfExists('forms')
    .dropTableIfExists('admins')
    .dropTableIfExists('settings')
    // Create tables
    .createTable('admins', function(table) {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('password').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    })
    .createTable('forms', function(table) {
      table.increments('formid').primary();
      table.string('title').notNullable();
      table.text('description');
      table.text('starter_prompt');
      table.text('output_prompt');
      table.boolean('active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    })
    .createTable('prompts', function(table) {
      table.increments('promptid').primary();
      table.integer('formid').references('formid').inTable('forms').onDelete('CASCADE');
      table.text('question_text').notNullable();
      table.string('variable_name');
      table.text('validation_criteria');
      table.integer('order').notNullable();
      table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    })
    .createTable('responses', function(table) {
      table.increments('responseid').primary();
      table.integer('formid').references('formid').inTable('forms').onDelete('CASCADE');
      table.json('responses').notNullable();
      table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    })
    .createTable('settings', function(table) {
      table.string('key').primary();
      table.json('value').notNullable();
      table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('responses')
    .dropTableIfExists('prompts')
    .dropTableIfExists('forms')
    .dropTableIfExists('settings')
    .dropTableIfExists('admins');
};
