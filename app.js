const express = require("express");
const app = express();
const db = require("./database/db.js");

app.use(express.json());

db.sync()
  .then(() => console.log("Database synced"))
  .catch((err) => console.error(err));