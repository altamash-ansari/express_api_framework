/*
  Middleware to provide dynamic cors functionality
  Config contains the variable `origins` which may be an array of whitelisted origins.
  If not provided, all origins will be allowed for pre-flight requests.
*/
const cors  = require("connect-cors")

/* istanbul ignore next */
module.exports = function(req, res, next) {
  const origins          = app.config.get("origins") || []
  const requestedHeaders = req.headers["access-control-request-headers"]
  const headers          = (requestedHeaders && requestedHeaders.split(", ")) || Object.keys(req.headers)

  return cors({
    origins: origins.concat([]),
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    headers: headers
  })(req, res, next) 
}