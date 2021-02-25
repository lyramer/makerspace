// followed https://medium.com/javascript-in-plain-english/secure-react-express-apps-jsonwebtoken-cookie-session-auth0-and-passport-tutorial-e58d6dce6c91
// to implement auth/passport/jwt stuff
const dotenv = require("dotenv").config();
const express = require("express");
const user = require("./user.js");
const item = require("./item.js");
const items = require("./items.js");
const auth = require("./auth.js");
const stripeCreateBillingSession = require("./stripe-create-billing-session.js");
const stripeWebhook = require("./stripe-webhook.js");
const stripeCreateCheckoutSession = require("./stripe-create-checkout-session.js");
const newsletter = require("./newsletter.js");
const passport = require('./middleware/passport');
const session = require('cookie-session');
const helmet = require('helmet');
const hpp = require('hpp');
const csurf = require('csurf');
const proxy = require('http-proxy-middleware').createProxyMiddleware;
const rateLimit = require("express-rate-limit");

/* Create Express App */
const app = express();


// ------------------
// SECURITY STUFF
// ------------------
  /* Set Up Limiter */
  // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // see https://expressjs.com/en/guide/behind-proxies.html
  // app.set('trust proxy', 1);

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });


  /* Set Security Configs */
  app.use(helmet());
  app.use(hpp());

  /* Set Cookie Settings */
  app.use(
      session({
          name: 'session',
          secret: process.env.COOKIE_SECRET,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      })
  );
  app.use(csurf());
  app.use(limiter);
// ------------------


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

app.use("/api/auth", auth)
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

