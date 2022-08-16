/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 const knex = require('../db')
exports.up =async function(knex) {
    await knex.schema.hasTable('transfers').then(async (exists) => {
        if (!exists) {
          await knex.schema
            .createTable('transfers', async (table) => {
              table.increments('transferId')
              table.integer('transferred_from').unsigned().references('users.personId')
              table.integer('transferred_to').unsigned().references('users.personId')
              table.string('amount')
              table.string('account_status')
              table.timestamps()
            })
            .then(() => {
              console.log('Transfers Table created Successfully')
            })
            .catch((err) => console.log(err))
        }
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
