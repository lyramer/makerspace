// note that while this is NOT imported anywhere, it is still being used by npm
// to make a proxy. harrumph.

const proxy = require('http-proxy-middleware').createProxyMiddleware;
const dotenv = require("dotenv");
dotenv.config();

module.exports = function (app) {
    app.use(proxy(`/api/auth/**`, { target: "http://" + process.env.ORIGIN_URL }));
  };