/* istanbul ignore next */
module.exports = {
  requestLogger        : require("./request-logger"),
  validateContentType  : require("./validate-content-type"),
  cors                 : require("./cors"),
  poweredBy            : require("./powered-by"),
  handleBodyParserError: function (error, req, res, next) {
    if (error){
      if(error instanceof SyntaxError) {
        res.status(400).send({
          error_message: "Malformed Body"
        })
      }
      else {
        res.status(400).send({
          error_message: error.message
        })
      }
    } else {
      next()
    }
  },
  load: function (path, middlewares, app) {
    // Path is a option parameter
    var args = arguments

    if (args.length == 2) {
      app = middlewares
      middlewares = path
      path = "/"
    }

    middlewares.forEach(function (middleware) {
      app.use(path, middleware)
    })
  }
}