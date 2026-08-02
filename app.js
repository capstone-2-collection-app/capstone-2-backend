require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { db } = require("./database/index.js");
const userRouters = require("./routes/userRoutes.js");
const searchRouter = require("./routes/search_router.js");
const collectionRouter = require("./routes/collections.js");
const guestIdMiddleware = require("./middleware/cookieParser.js");
const errorHandler = require("./middleware/errorHandler.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "https://capstone-2-frontend-gilt.vercel.app",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(guestIdMiddleware);

// public route


app.use("/user", userRouters);

app.use("/search", searchRouter); // added auth - only authorized user can request this route
app.use("/api", collectionRouter); // added auth - only authorized user can request the route

app.use(errorHandler);

app.get("*", (req, res)=>{
  res.redirect("/user")
})
db.sync()
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.error(err));
