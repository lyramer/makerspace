const { Pool } = require('pg')

const dotenv = require("dotenv");

dotenv.config();

const databaseConfig = { connectionString: process.env.DB_URL };
const pool = new Pool(databaseConfig);

module.exports = {
    pool
  };
