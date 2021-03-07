// MODIFIED FROM ED HEMPHILL'S PASSPORT-DISCOURSE LIBRARY
// https://github.com/edhemphill/passport-discourse
//
// Load modules.
var passport = require('passport-strategy')
  , util = require('util')
  , Profile = require('./profile')
  , discourse_sso  = require("./discourse-sso.js");
  // , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  // , APIError = require('./errors/apierror');


var log_debug = function() {

}

var log_debug_ON = function() {
    //var args = Array.prototype.slice.call(arguments);
    //args.unshift("WebDeviceSim");
    if(global.log)
        log.debug.apply(log,arguments);
    else {
        var args = Array.prototype.slice.call(arguments);
        args.unshift("DEBUG [passport-discourse]");
        console.log.apply(console,args);
    }
};

var Provider = null;

/**
 * `Strategy` constructor.
 *
 * The GitHub authentication strategy authenticates requests by delegating to
 * GitHub using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your GitHub application's Client ID
 *   - `clientSecret`  your GitHub application's Client Secret
 *   - `callbackURL`   URL to which GitHub will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request.  valid scopes include:
 *                     'user', 'public_repo', 'repo', 'gist', or none.
 *                     (see http://developer.github.com/v3/oauth/#scopes for more info)
 *   — `userAgent`     All API requests MUST include a valid User Agent string.
 *                     e.g: domain name of your application.
 *                     (see http://developer.github.com/v3/#user-agent-required for more info)
 *
 * Examples:
 *
 *     passport.use(new GitHubStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/github/callback',
 *         userAgent: 'myapp.com'
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
  options = options || {};
  if(typeof verify !== 'function') throw new TypeError("passport-discourse requires a verify callback");


  if(options.debug) {
    log_debug = log_debug_ON;
  }

  if(!Provider) Provider = new discourse_sso(options);

  passport.Strategy.call(this);
  this.name = 'discourse';

  this.verify_cb = verify;
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, passport.Strategy);

var route_callback = Strategy.route_callback = process.env.RETURN_URL;

/**
 * Retrieve user profile from GitHub.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `github`
 *   - `id`               the user's GitHub ID
 *   - `username`         the user's GitHub username
 *   - `displayName`      the user's full name
 *   - `profileUrl`       the URL of the profile for the user on GitHub
 *   - `emails`           the user's email addresses
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  var self = this;
}

Strategy.prototype.authenticate = function(req, options) {
  var self = this;

  if(!options) options = {};


  // console.log("*************************************************");
  // console.log("Strategy:", this);
  // console.log(req.originalUrl);
  // console.log(route_callback);
  // console.log(options)
  // console.log("*************************************************");


  function _verify_discourse_sso(req,res) {
    //console.log("VERIFY -------------------------------------------------",req.originalUrl);
    //console.log("req:",req);
    //console.log("-------------------------------------------------");

    var ret = Provider.validateAuth(req.originalUrl);
    //console.log(ret)
    var profile = {...ret};
    // TODO: commented-out version is probably safer but I'm gonna grab all of ret for now...
    //var profile = (({ admin, moderator, email, avatar_url, name, username }) => ({ admin, moderator, email, avatar_url, name, username }))(ret);

    // if you want to uncomment this you need to also add back in the
    // params in the verify function in passport.js
    //self.verify_cb(null,null,profile,function(){
    self.verify_cb(profile,function(){
        if(ret) {
          self.success(profile); // ,info ?
      } else {
          self.fail("Failed to validate user"); // ,info ?
      }
    });
  }

  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  // var s = req.originalUrl.split(route_callback);

  // if the request is for the callback uri / path coming back from Discourse
  if(options.type == "verify") _verify_discourse_sso(req);

  // if the request is for sending folks to Discourse to log in
  else {
    var referal_url = "http://" + process.env.ORIGIN_URL + process.env.RETURN_URL;   
    var argz = arguments;
    var auth_req = Provider.generateAuthRequest(referal_url,options).then(function(ret){
      // console.log("REDIRECT TO AUTHENTICATE ON DISCORD -------------------------------");
      // console.log("redirect to:",ret.url_redirect);
      log_debug("argz:",argz);
      self.redirect(ret.url_redirect);
    });    
  }

}

// Expose constructor.
module.exports = Strategy;
