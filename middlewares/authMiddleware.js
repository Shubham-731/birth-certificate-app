const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv/config");

const jwtSecret = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (authToken) {
    jwt.verify(authToken, jwtSecret, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/users/login");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/users/login");
  }
};

const checkUser = (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (authToken) {
    jwt.verify(authToken, jwtSecret, async (err, decodedToken) => {
      if (err) {
        console.log(err);
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decodedToken);
        req.user = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        };
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };
