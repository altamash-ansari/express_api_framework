const express     = require("express")
const nconf       = require("nconf")
const winston     = require("winston")
const bodyParser  = require("body-parser")
const setupConfig = require("../config.json")
const utils       = require("../lib/utils")
const middlewares = require("../middlewares")
const routeLoader = require("../lib/route-loader")

global.app        = express()
global.utils      = utils
/**
 * Sets envirnoment varaible on app
 */
app.env = process.env.NODE_ENV || /* istanbul ignore next */ "test"

/*
  Getter setter methods for app configs
*/
app.config = nconf

/*
  Add more configs
*/
app.mergeConfig = function(name, config) {
  app.config.add(name, { type: "literal", store: utils.extend(config["defaults"]|| /* istanbul ignore next */ {}, config[app.env]) })
}

/*
  Merges setup configs
*/
app.mergeConfig("defaults", setupConfig)

app.logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.label({
      label: process.pid
    }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new (winston.transports.Console)({
      json     : true,
      stringify: true
    })
  ]
})

/* istanbul ignore next */
module.exports = {
  // starts the app on the port specified in the config
  start: function() {
    return this.startWithPort(app.config.get("server:port"))
  },
  getAppInstance: function(){
    return app
  },
  // really start the app on a port
  startWithPort: function(port) {
    app.listener = app.listen(port)

    try{
      app.logger.log("info", `Listening over HTTP on port: ${app.listener.address().port}, Envirnoment: ${app.env}`)
    }
    catch(e){
      // listener.address() was null
      app.logger.log("info", `Listening over HTTP on port: ${port}, Envirnoment: ${app.env}`)
    }
    
    return utils.Promise.resolve(app)
    .then(() => {
      return middlewares.load("/", [
        /**
         * Do not change the orders
         */
        middlewares.requestLogger,
        middlewares.pragmaticRest,
        middlewares.validateContentType,
        bodyParser.json({
          limit: "50mb"
        }),
        bodyParser.urlencoded({
          extended: true,
          limit   : "50mb",
          type    : "application/x-www-form-urlencoded"
        }),
        middlewares.handleBodyParserError,
        middlewares.cors,
        middlewares.poweredBy,
        middlewares.requestParams
      ], app)
    })
    .then(function(){
      // Router module loads each modules routes.js file
      routeLoader(app)
    })
    .then(() => {
      // Notify at process level that the server is up and running (Required for naught)
      this.notifyOnline()
    })
    .catch(function(err){
      /* eslint-disable-next-line */
      app.logger.error(err && err.stack)
      module.exports.shutdown(1)
    })
  },
  // notify that this app is online
  notifyOnline: function() {
    var that = this
    // if this is a multiprocess naught app
    if (process.send) {
      // this worker is online
      process.send("ready")
      process.send("online")

      if (app.config.get("suicideTimeout")) {
        // convert hours to ms
        var timeout = (app.config.get("suicideTimeout")*60*60*1000) + Math.random()*5000

        setTimeout(function() {
          process.send("offline")
          that.shutdown()
        }, timeout)
      }

      // to gracefully shutdown
      process.on("message", function(message) {
        if (message === "shutdown") {
          that.shutdown()
        }
      })
    }
  },
  shutdown: function(code = 0) {
    process.exit(code)
  }
}

process.on("SIGINT", module.exports.shutdown)
process.on("SIGTERM", module.exports.shutdown)