//nmp packages
const express = require("express");
const cors = require("cors");
const app = express();
const { db } = require("./database/index.js");
const userRouters = require("./routes/userRoutes.js");
const search_router = require("./routes/search_router.js");
const collection_router = require("./routes/collections.js");
const errorHandler = require("./middleware/errorHandler.js");

//middleware
app.use(express.json());
app.use(cors());

//Routes
app.use("/search", search_router);
app.use("/api", collection_router);

// router for auth
app.use("/user", userRouters); // mounted userRouters

// error handler at the end
app.use(errorHandler);

db.sync()
  .then(() => {
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => console.error(err));
