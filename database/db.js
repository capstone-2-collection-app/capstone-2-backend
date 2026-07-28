const dotenv = require("dotenv");
dotenv.config();
const { Sequelize } = require("sequelize");

const db = new Sequelize(process.env.DATABASE_URL, {
  logging: false, // set to console.log if you want to see the SQL Sequelize generates
  dialectOptions: process.env.DATABASE_URL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
})

module.exports = db;