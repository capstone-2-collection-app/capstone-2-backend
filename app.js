//nmp packages
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")

const { db } = require("./database/index.js");

const errorHandler = require("./middleware/errorHandler.js");
const guestIdMiddleware = require("./middleware/cookieParser.js");

const app = express();


//middleware
app.use(express.json());
// app.use(cors())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());

app.use(guestIdMiddleware);
app.use(errorHandler);

//Mount routes after guestIdMiddleware 
const userRouters = require("./routes/userRoutes.js");
const search_router = require("./routes/search_router.js")
const collection_router = require("./routes/collections.js")

//Routes
app.use('/search', search_router)
app.use('/api', collection_router)

// router for auth
app.use("/user", userRouters); // mounted userRouters


db.sync()
  .then(() => {
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => console.error(err));
