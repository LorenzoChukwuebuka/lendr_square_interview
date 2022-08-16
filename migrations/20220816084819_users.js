/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const knex = require('../db')
exports.up = async function (knex) {
  await knex.schema.hasTable('users').then(async (exists) => {
    if (!exists) {
      await knex.schema
        .createTable('users', async (table) => {
          table.increments('personId')
          table.string('firstName')
          table.string('middleName')
          table.string('lastName')
          table.string('email')
          table.string('address')
          table.string('password')
          table.boolean('isDeleted').defaultTo('false')
          table.timestamps()
        })
        .then(() => {
          console.log('User Table created Successfully')
        })
        .catch((err) => console.log(err))
    }
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {}
