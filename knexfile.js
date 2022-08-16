require('dotenv').config()

module.exports = {
  development: {
    client: 'mysql2',
    version: '5.7',
    connection: {
      host: process.env.dbHost,
      user: process.env.dbUser,
      password: process.env.dbPass,
      database: process.env.dbName,
      port: process.env.dbPort || 3306,
    },
  },
  production: {
    client: 'mysql2',
    version: '5.7',
    connection: {
      host: '127.0.0.1',
      user: process.env.dbUser,
      password: process.env.dbPass,
      database: ' lendr_interview',
    },
  },
  testing: {
    client: 'mysql2',
    version: '5.7',
    connection: {
      host: '127.0.0.1',
      user: process.env.dbUser,
      password: process.env.dbPass,
      database: ' lendr_interview',
    },
  },
}
