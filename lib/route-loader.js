const autoRequire      = require("./auto-require")
const fs               = require("fs")
const baseCtrl         = require("./base")
const SERVICE_PATH     = __dirname + "/../api-server/services"
const ROUTES_FILE_PATH = "routes.js"

function path() {
  var path = ""
  for (var index = 0; index < arguments.length; index++) {
    // To avoid a tailing "/"
    if (index === arguments.length - 1) {
      path += arguments[index]
    }
    else
      path += arguments[index] + "/"
  }
  return path
}

/* istanbul ignore next */
function loadPlugins(dirPath, loaderFile, callback) {
  /* istanbul ignore next */
  callback = callback || function () { }
  /* istanbul ignore if */
  if (!fs.existsSync(dirPath)) {
    return
  }

  const directories = autoRequire.listDir(dirPath)
  directories.forEach(function (directory) {
    const routesFilePath = path(dirPath, directory, loaderFile)
    /* istanbul ignore if */
    if (!fs.existsSync(routesFilePath)) {
      return
    }

    callback(require(routesFilePath))
  })
}

/**
 * Adds each route in routes.js as well binds with it base controller's context
 * @param  {Object} app     Express App
 * @param  {String} phase   Phase can be either init, pre, post
 * @param  {Object} routes  All routes defined in a single plugin
 * @param  {Object} route   A single route. Used for recurrtion 
 * @param  {Array}  befores All before hooks associated with a single route
 * @return void
 */
/* istanbul ignore next */
function mapThroughRoutes(app, phase, routes, route, befores, afters) {
  route   = route || ""
  befores = befores || []
  afters  = afters || []
  // Functions that need to be executed before any sub route is executed
  if (typeof routes["before"] === "function" && phase === "_pre") {
    befores = befores.concat(routes["before"].bind(baseCtrl))
    delete routes["before"]
  }
  // Functions that need to be executed after any sub route is executed
  if (typeof routes["after"] === "function" && phase === "_pre") {
    afters = afters.concat(routes["after"].bind(baseCtrl))
    delete routes["after"]
  }
  
  for (const key in routes) {
    if(isRoute(key)){
      mapThroughRoutes(app, phase, routes[key], route + key, befores, afters)
    } else {
      let args
      // System is to be started in a given phase ()
      if(phase && utils.isFunction(routes[key][phase])){
        args = [route].concat(befores).concat(routes[key][phase].bind(baseCtrl)).concat(afters)
        bindRouteHandler(key, args)
      } else if(utils.isFunction(routes[key]) && phase === "_pre"){
        args = [route].concat(befores).concat(routes[key].bind(baseCtrl)).concat(afters)
        bindRouteHandler(key, args)
        delete routes[key]
      }
    }
  }
}

/* istanbul ignore next */
function bindRouteHandler(key, args) {
  const callbacks        = args.splice(1, args.length)
  const wrappedCallbacks = wrapCallbacksInPromise(callbacks)

  args.push(wrappedCallbacks)
  
  key = key.toLowerCase()
  app[key].apply(app, args)
}

/* istanbul ignore next */
function wrapCallbacksInPromise(callbacks){
  return callbacks.map(function(callback){
    return function(req, res, next){
      const middlewarePromise = callback(req, res)

      if(middlewarePromise && middlewarePromise.then){
        middlewarePromise
        .then(function(){
          next()
        }, function(err){
          if(!err.builtResponse)
            next(err)
        })
      }
    }
  })
}

// Method check if the path is of type "/something"
/* istanbul ignore next */
function isRoute(path) {
  /* eslint-disable-next-line */
  const regex = new RegExp("\/.*")
  return (typeof path === "string") && !!path.match(regex)
}

// This method attaches a ExpressJS' error handler which emits a error event.
/* istanbul ignore next */
function registerErrorCallback(app){
  /* eslint-disable-next-line */  
  app.use(function(err, req, res, next){
    req.emit("error", err)
  })
}

// Loads all dependent modules before app is started
// We then traverse through the lib directory to load the other plugins
function loadModules(pluginDir){
  try {
    let plugins = autoRequire.listDir(pluginDir)
    
    plugins = plugins.filter(function(plugin) {
      if(plugin.indexOf(".DS_Store") === 0) {
        return false
      }
      else {
        return true
      }
    })

    const loaderTasks = plugins.map(function(plugin) {
      return function(){
        return require(pluginDir + "/" + plugin)(app)
      }
    })

    return utils.Promise.sequence(loaderTasks)
  }
  catch (err) {
    /* eslint-disable-next-line */
    console.error(new Date().toISOString(), err, err.stack)
  }
}

/* istanbul ignore next */
module.exports = function(app) {
  loadModules(SERVICE_PATH)

  loadPlugins(SERVICE_PATH, ROUTES_FILE_PATH, mapThroughRoutes.bind(null, app, "_pre"))

  loadPlugins(SERVICE_PATH, ROUTES_FILE_PATH, mapThroughRoutes.bind(null, app, "_post"))
 
  loadPlugins(SERVICE_PATH ,ROUTES_FILE_PATH, mapThroughRoutes.bind(null, app, "_send"))

  registerErrorCallback(app)
}