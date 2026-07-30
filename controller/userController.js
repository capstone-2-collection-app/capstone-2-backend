const { User } = require("./../database/models");
const bcrypt = require("bcrypt"); // import bcrypt
const validator = require("validator");

// login user
const loginUser = async (req, res) => {
  res.json({ message: "user login" });
};

// signup user
const signupUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // validate all inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Input Require For All Fields" });
    }

    // validate valid email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Please enter the valid email address.",
      });
    }

    // valide strong password (CapitalLowerCase!@#Number)
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password is not strong enough.",
      });
    }

    // check if the email is already registered
    const isRegisteredEmail = await User.findOne({
      where: { email },
    });
    if (isRegisteredEmail) {
      // conflict client error
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    // if all conditions agreed hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // create the user
    const newUser = await User.create({
      name,
      email,
      password: hash,
    });

    // respond
    res.status(201).json({
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
};

module.exports = { loginUser, signupUser };
