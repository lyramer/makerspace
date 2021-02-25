const express = require('express');
var https = require('https');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();


// FIXME garbage toy routes
router.get("/wow", (req, res) => {
    console.log("wooooow")
    res.send("<a href='/auth/login'>Login</a>");
})

// this is the route we send clients to in order to sign on Discourse server
router.get("/discourse_sso", passport.authenticate("discourse", {type: "signin"}));

const verification_config = {
    type: 'verify',
    // successRedirect: process.env.PROXY_URL + "/dashboard",
    // failureRedirect: process.env.PROXY_URL + "/login"
}

// this is the callback route when clients return from discourse server
router.get('/discourse_sso/callback', (req, res, next) => {
    passport.authenticate('discourse', verification_config, (err, profile) =>{
        if (err) {
            // throw new TypeError("Discourse verification failed");
            console.log(err)
            return res.redirect(process.env.PROXY_URL + "/auth/login");
        }
        
        req.session.jwt = jwt.sign(profile, process.env.JWT_SECRET_KEY);
        console.log(req.session)
        console.log("User logged in:", profile)

        return res.redirect(process.env.PROXY_URL + "/dashboard");
    })(req, res, next);
});

function sendBullshitDeleteRequest() {
    const options = {
        hostname: process.env.SSO_URL,
        port: 443,
        path: '/session/andy.wynden',
        method: 'DELETE',
        headers: {
          'Content-Type': 'text/plain',
        }
     };

     const deleteReq = https.request(options, (deleteRes) => {
        console.log(`statusCode: ${deleteRes.statusCode}`)
      
        deleteRes.on('data', (d) => {
          process.stdout.write(d)
        })
      })


      deleteReq.on('error', (error) => {
        console.error(error)
      })
      
      deleteReq.write("testy")
      deleteReq.end()

}

router.get('/logout', (req, res) => {

    sendBullshitDeleteRequest();
    req.session = null;
    const homeURL = encodeURIComponent(process.env.PROXY_URL);
    return res.redirect(
        // FIXME: I think this is just part of the archaic system
        // where we redirected to old.makerspace.ca to get redirected back to 
        // the talk forum upon signout
        //`${process.env.SSO_URL}/session/sso?return_path=${homeURL}`
        process.env.PROXY_URL
    );
});



const jwtRequired = passport.authenticate('jwt', { session: false });

router.get('/private-route', jwtRequired, (req, res) => {
    return res.send('This is a private route');
});

router.get('/current-session', (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            res.send(false);
        } else {
            res.send(user);
        }
    })(req, res);
});

module.exports = router;
