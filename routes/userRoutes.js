const express = require("express");
const { loginUser, signupUser } = require("./../controller/userController");
const router = express.Router();

// login
router.post("/login", loginUser);

// create user and sign in
router.post("/signup", signupUser);

// logout

module.exports = router;
