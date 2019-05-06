// Respond. Will respond with different content types based on the accept header.
/* istanbul ignore next */
const respond = module.exports.respond = function(req, res, json, status) {
  const PMTEMPLATE = "<script> \
    window.parent.postMessage( \
        '%{data}', \
        '%{host}' \
    ) \
  </script>"
  
  let contentType = "application/json"
  let body

  switch (req.headers.accept) {
    case "text/javascript": {
      body        = JSON.stringify(json)
      const jscb  = (req.query["callback"]) || "builtio_callback"
      body        = jscb + "(" + body + ")"
      contentType = "text/javascript"
      break
    }
    
    case "text/html": {
      // merge the postmessage payload
      const payload = req.payload["postmessage_payload"] || req.payload["POSTMESSAGE_PAYLOAD"]

      if (payload) {
        utils.extend(json, {
          postmessage_payload: payload
        })
      }

      body        = utils.jsesc(JSON.stringify(json))
      contentType = "text/html"
      const host  = req.payload["host"] || req.payload["HOST"] || app.config.get("manageUrl")

      body = PMTEMPLATE.replace("%{data}", body)
      body = body.replace("%{host}", host)
      break
    }

    default: {
      body = JSON.stringify(json)
    }
  }

  res.writeHead(status, {
    "Content-Type": contentType
  })
  return res.end(body)
}

/* istanbul ignore next */
var breakPromise = module.exports.breakPromise = function (req) {
  return utils.Promise.reject({
    builtResponse: true,
    url          : req.url
  })
}

/* istanbul ignore next */
module.exports.resSuccess = function(req, res, json, status){
  if (res.headersSent) {
    return breakPromise(req, res)
  }

  status = status || 200
  respond(req, res, json, status)
  // Breaks the promise chain from executing any further
  // return utils.Promise.deferredPromise
  return breakPromise(req, res)
}

/* istanbul ignore next */
const resError = module.exports.resError = function(req, res, error_message, error_code, errors, status){
  if (res.headersSent) {
    return breakPromise(req, res)
  }

  status          = status || 422
  const errorObj    = {}
  const errorStruct = {
    error_message: error_message,
    error_code 		: error_code
  }

  try{
    if(!utils.isEmpty(errors)){
      errors.forEach(function(err){
        errorObj[err.path] = errorObj[err.path] || []
        errorObj[err.path].push(req.t(err.errorKey, err.errorData))
      })
      // Assign transformed errors to errorStruct
      errorStruct["errors"] = errorObj
    }
  }
  catch(e){
    // skip catch block
  }

  respond(req, res, errorStruct, status)
  // Breaks the promise chain from executing any further
  // return utils.Promise.deferredPromise
  return breakPromise(req, res)
}
/*
  Returns key if it exists in the headers or request payload.
  In the request payload, a capitalized version is searched for.
*/
/* istanbul ignore next */
module.exports.headerOrParam = function(key, req) {
  return req.headers[key] || req.params && req.params[key] || req.payload && (req.payload[key.toUpperCase()] || req.payload[key])
}

// Checks if the wrapper is in payload
/* istanbul ignore next */
module.exports.hasWrapper = function(wrapper, validator, req) {
  validator = validator || utils.isPlainObject

  if (req.payload && validator(req.payload[wrapper])) {
    return utils.Promise.resolve(req.payload[wrapper])
  }
  else {
    return utils.Promise.reject()
  }
}

// Responds with an error if the request doesn't arrive in the appropriate wrapper.
/* istanbul ignore next */
module.exports.requireWrapper = function(req, res, wrapper, validator) {
  return module.exports.hasWrapper(wrapper, validator, req)
  .then(function(payload) {
    return payload
  }, function() {
    return resError(req, res,
      app.translate("genericErrors.wrapper", { wrapper: wrapper }),
      app.errorCodes("invalid_parameters")
    )
  })
}