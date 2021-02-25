// This really helped me understand what authentication is and JWT and stuff
// https://www.youtube.com/watch?v=2PPSXonhIck

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const passportDiscourse = require("./passport-discourse").Strategy;

// const dotenv = require("dotenv");
// dotenv.config();


// JWT PASSPORT STUFF
const jwtStrategy = new JwtStrategy({
    jwtFromRequest: (req) => req.session.jwt,
    secretOrKey: process.env.JWT_SECRET_KEY,
},
(payload, done) => {
    // TODO: add additional jwt token verification
    return done(null, payload);
}
);

passport.use(jwtStrategy);



// DISCOURSE AUTH STUFF
const auth = {
    "ssoSecret": process.env.SSO_SECRET,
    "proxyPath": process.env.PROXY_URL,
    "discoursePath" : `https://${process.env.SSO_URL}`,
    "enabled": true
}  

// really not sure what this layer is supposed to do.
// I think it gets called by passport.authenticate on the 
// /discourse_sso/callback route in auth.js
// which in turn calls _verify_discourse_sso which passes through
// an anonymous function for done

function verify(profile, done) {
    //usedAuthentication("discourse");
    done(null, profile);

}

  // initializing passport-discourse
  if (auth.enabled) {
    var auth_discourse = new passportDiscourse({
      secret: auth.ssoSecret,
      discourse_url: auth.discoursePath,
      debug: false
    }, verify);

    // TODO - do we need the access & refresh tokens? they don't seem to be passed through anyways...
    // TODO - replaced the below anonymous function with the verify function declared above
    //},function(accessToken, refreshToken, profile, done){
    //     //usedAuthentication("discourse");
    //     done(null, profile);
    // });
  
    passport.use(auth_discourse);
  
    passport.serializeUser(function(user, done) {
      done(null, user);
    });
    passport.deserializeUser(function(user, done) {
      done(null, user);
    });
  }



module.exports = passport;