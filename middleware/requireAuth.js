// jwt verification middleware
const jwt = require("jsonwebtoken");
const { User } = require("./../database/models");

const requireAuth = async (req, res, next) => {
  // destruct auth from req headers
  const { authorization } = req.headers;

  // check header had auth token // 401 user unauthorized
  if (!authorization) {
    return res.status(401).json({
      message: "Authorization token required.",
    });
  }

  // if token exist - extract the token  Bearer 234kheoierih234928
  const token = authorization.split(" ")[1];

  // verify the token // it take two arg - token itself and secret key
  try {
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(verifiedToken);

    // if token is valid find user with that token
    const user = await User.findByPk(verifiedToken.id, {
      attributes: {
        exclude: ["password"], // we don't want to expose hash user password
      },
    });

    // if no user
    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    // attach user to req
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

module.exports = requireAuth;
