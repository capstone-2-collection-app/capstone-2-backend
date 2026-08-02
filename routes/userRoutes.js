const express = require("express");
const {
  loginUser,
  logoutUser,
  signupUser,
  signupGuest,
} = require("./../controller/userController");
const router = express.Router();

// login
router.post("/login", loginUser);

//Guest
router.post("/guest", signupGuest);

// create user and sign in
router.post("/signup", signupUser);

// logout
router.post("/logout", logoutUser);

module.exports = router;
