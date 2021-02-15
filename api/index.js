require("dotenv").config();
const express = require("express");
const user = require("./user.js");
const item = require("./item.js");
const items = require("./items.js");
const requireAuth = require("./items.js");
const stripeCreateBillingSession = require("./stripe-create-billing-session.js");
const stripeWebhook = require("./stripe-webhook.js");
const stripeCreateCheckoutSession = require("./stripe-create-checkout-session.js");
const newsletter = require("./newsletter.js");
const passportDiscourse = require("passport-discourse").Strategy;
const passport = require("passport");
const dotenv = require("dotenv");
dotenv.config();
const app = express();



const auth = {
  "ssoSecret": process.env.SSO_SECRET,
  "proxyPath": process.env.PROXY_URL,
  "discoursePath" : process.env.SSO_URL,
  "enabled": true
}

app.get("/auth/discourse_sso", passport.authenticate("discourse"));


app.get(passportDiscourse.route_callback, passport.authenticate("discourse", {
  successRedirect: auth.proxyPath + "/auth/done",
  failureRedirect: auth.proxyPath + "/login"
}));


if (auth.enabled) {
  var auth_discourse = new passportDiscourse({
    secret: auth.ssoSecret,
    discourse_url: auth.discoursePath,
    debug: false
  },function(accessToken, refreshToken, profile, done){
      console.log("WOW")
      //usedAuthentication("discourse");
      done(null, profile);
  });

  passport.use(auth_discourse);

  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
}





// Get the raw body which is needed by Stripe webhook
const jsonOptions = {
  verify: (req, res, buf) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString("utf8");
    }
  },
};


app.use(passport.initialize());
app.use(passport.session());

app.use(express.json(jsonOptions));
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", user);
app.use("/api/item", item);
app.use("/api/items", items);
app.use("/api/stripe-create-billing-session", stripeCreateBillingSession);
app.use("/api/stripe-webhook", stripeWebhook);
app.use("/api/stripe-create-checkout-session", stripeCreateCheckoutSession);
app.use("/api/newsletter", newsletter);

app.listen(8080, function () {
  console.log("Server listening on port 8080");
});


// toy example 
app.get("/user/login", (req, res) => {
  res.send("<a href='/auth/discourse_sso'>Login</a>");
})
