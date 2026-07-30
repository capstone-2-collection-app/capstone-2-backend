const dotenv = require("dotenv");
dotenv.config();
const { Sequelize } = require("sequelize");

// Hosted Postgres (Render, Supabase, Neon...) requires SSL; a local postgres
// server does not support it at all, so only turn it on for remote hosts.
const isLocal = /@(localhost|127\.0\.0\.1)/.test(
  process.env.DATABASE_URL || "",
);

const db = new Sequelize(process.env.DATABASE_URL, {
  logging: false, // set to console.log if you want to see the SQL Sequelize generates
  dialectOptions: isLocal
    ? {}
    : {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
});

module.exports = db;
