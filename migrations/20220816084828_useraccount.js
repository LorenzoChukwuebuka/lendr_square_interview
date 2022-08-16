/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 */
const knex = require('../db')
exports.up = async function (knex) {
  await knex.schema.hasTable('useraccount').then(async (exists) => {
    if (!exists) {
      await knex.schema
        .createTable('useraccount', async (table) => {
          table.increments('useraccountId')
          table.string('transaction_type')
          table.string('transaction_reference')
          table.integer('user_id').unsigned().references('users.personId')
          table.string('amount')
          table.string('wallet_balance')
          table.string('previous_wallet_balance')
          table.string('account_status')
          table.timestamps()
        })
        .then(() => {
          console.log('Useraccounts Table created Successfully')
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
