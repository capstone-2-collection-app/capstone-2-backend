const { User } = require("./../database/models");
const bcrypt = require("bcrypt"); // import bcrypt
const validator = require("validator");
const jwt = require("jsonwebtoken");

// create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    //check the input fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Input cannot be empty.",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    // if user not found by this email -> then email is incorrect
    if (!user) {
      return res.status(400).json({
        message: "Incorrect Email.",
      });
    }

    // if the email is correct -> check the password
    const isCorrectPw = await bcrypt.compare(password, user.password);

    // if the password is not correct
    if (!isCorrectPw) {
      return res.status(400).json({
        message: "Incorrect Password.",
      });
    }

    // if email and password match! token for you
    const token = createToken(user.id);

    res.status(200).json({
      email,
      token,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
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

    // create jwt
    const token = createToken(newUser.id);

    // respond
    res.status(201).json({
      name: newUser.name,
      email: newUser.email,
      token,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
};

module.exports = { loginUser, signupUser };
