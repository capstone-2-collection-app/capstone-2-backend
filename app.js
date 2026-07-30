//nmp packages
const express = require("express");
const cors = require("cors");

//server imports
const {db} = require("./database/index.js");
const search_router = require("./routes/search_router.js")
const collection_router = require("./routes/collections.js")

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//Routes
app.use('/search', search_router)
app.use('/api', collection_router)


db.sync()
  .then(() => {
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch((err) => console.error(err));