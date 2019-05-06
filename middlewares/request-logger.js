var onHeaders      = require("on-headers")

// Logs the specifics of this request onto the console,
/* istanbul ignore next */
module.exports = function(req, res, next) {
  if (process.env.NODE_ENV !== "test") {
    var url    = req.url
    var header = req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"] || req.connection.remoteAddress
    var method = req.method
    var dLevel = app.config.get("debug")

    if (dLevel === 3) {
      req.logID  = Math.floor(Math.random()*100000)
      var start  = new Date

      var requestLog = {
        "event"      : "START",
        "id"         : req.logID,
        "process_pid": process.pid,
        "header"     : header,
        "timestamp"  : new Date,
        "method"     : method,
        "url"        : url
      }
      
      app.logger.info(requestLog)

      onHeaders(res, function() {
        req.params      = req.params || {}
        var duration    = new Date - start
        var responseLog = {}
        responseLog     = {
          "event"      : "STOP",
          "id"         : req.logID,
          "process_pid": process.pid,
          "header"     : header,
          "timestamp"  : new Date,
          "method"     : method,
          "url"        : url,
          "duration"   : duration,
          "status_code": res.statusCode
        }
        
        app.logger.info(responseLog)
      })
    }
  }
  next()
}
