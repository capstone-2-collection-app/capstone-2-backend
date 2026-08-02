const { User } = require("./../database/models");
const bcrypt = require("bcrypt"); // import bcrypt
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");


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
      message: "Login Failed.",
    });
  }
};

// signup user
const signupUser = async (req, res) => {
  console.log("hit")
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
    console.log(error.message)
    res.status(400).json(error.message);
  }
};

// logout
const logoutUser = (req, res) => {
  res.status(200).json({
    message: "Successfully Logged out.",
  });
};



// Creates a temporary guest account so users can try the app without signing up.
const signupGuest = async (req, res) => {
  try {

    // Generate a unique fake email so it doesn't collide with auth
    const guestEmail = `guest_${uuidv4()}@guest.local`;

   //random value just satisfies password and is discarded.
    const randomPassword = uuidv4();

    // Hash the throwaway password the same way signupUser
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(randomPassword, salt);

    // Create a real row in the User table.
    // User.findByPk(...)
    const guestUser = await User.create({
      name: "Guest",
      email: guestEmail,
      password: hash,
      isGuest: true,//model changes
    });

    // Issue a JWT the same way loginUser/signupUser do
    const token = createToken(guestUser.id);

    // Response same shape as loginUser/signupUser, plus an isGuest flag
    // so the frontend can optionally show different UI (e.g. "Sign up to save").
    res.status(201).json({
      name: guestUser.name,
      email: guestUser.email,
      token,
      isGuest: true,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: "Guest login failed." });
  }
};

module.exports = { loginUser, logoutUser, signupUser, signupGuest };

