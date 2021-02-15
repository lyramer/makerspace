const fakeAuth = require("fake-auth");
const express = require("express");
const router = express.Router();
const passportDiscourse = require("passport-discourse").Strategy;
const passport = require("passport");
const dotenv = require("dotenv");
dotenv.config();


const app = express();


// const auth = {
//   "ssoSecret": process.env.SSO_SECRET,
//   "proxyPath": process.env.PROXY_URL,
//   "discoursePath" : process.env.SSO_URL,
//   "enabled": true
// }

// app.get("/auth/discourse_sso", passport.authenticate("discourse"));


// app.get(passportDiscourse.route_callback, passport.authenticate("discourse", {
//   successRedirect: auth.proxyPath + "/auth/done",
//   failureRedirect: auth.proxyPath + "/login"
// }));


// if (auth.enabled) {
//   var auth_discourse = new passportDiscourse({
//     secret: auth.ssoSecret,
//     discourse_url: auth.discoursePath,
//     debug: false
//   },function(accessToken, refreshToken, profile, done){
//       console.log("WOW")
//       //usedAuthentication("discourse");
//       done(null, profile);
//   });

//   passport.use(auth_discourse);

//   passport.serializeUser(function(user, done) {
//     done(null, user);
//   });
//   passport.deserializeUser(function(user, done) {
//     done(null, user);
//   });
// }

// Get the raw body which is needed by Stripe webhook
const jsonOptions = {
  verify: (req, res, buf) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString("utf8");
    }
  },
};

// // toy example 
// app.get("/user/login", (req, res) => {
//   res.send("<a href='/auth/discourse_sso'>Login</a>");
// })
// app.use(passport.initialize());
// app.use(passport.session());


// Middleware for requiring authentication and getting user
const requireAuth = async (req, res, next) => {
  // Respond with error if no authorization header
  if (!req.headers.authorization) {
    return res.status(401).send({
      status: "error",
      message: "You must be signed in to call this endpoint",
    });
  }

  // Get access token from authorization header ("Bearer: xxxxxxx")
  const accessToken = req.headers.authorization.split(" ")[1];

  try {
    // Get user from token and add to req object
    req.user = fakeAuth.verifyAccessToken(accessToken);
    console.log(accessToken)
    console.log(req.user)
    // Call route function passed into this middleware
    return next();
  } catch (error) {
    console.log("_require-auth error", error);

    // If there's an error assume token is expired and return
    // auth/invalid-user-token error (handled by apiRequest in util.js)
    res.status(401).send({
      status: "error",
      code: "auth/invalid-user-token",
      message: "Your login has expired. Please login again.",
    });
  }
};

module.exports = requireAuth;
