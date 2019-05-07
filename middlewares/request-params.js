/*
  A middleware to coalesce the query and body portions of the request,
  ala rails.
*/
var multiparty = require("multiparty")
var qsNew      = require("qs")

/* istanbul ignore next */
var iterateHash = function(hash, parameters) {
  utils.forEach(hash, function(value, key) {
    if(utils.isString(value)){      
      hash[key] = parameters[value]
    }
    else{
      iterateHash(value , parameters)
    }    
  })
  return hash
}

/* istanbul ignore next */
var hasBody = function(req) {
  var encoding = "transfer-encoding" in req.headers
  var length   = "content-length" in req.headers && req.headers["content-length"] !== "0"
  return encoding || length
}

/* istanbul ignore next */
var mime = function(req) {
  var str = req.headers["content-type"] || ""
  return str.split(";")[0]
}

/* istanbul ignore next */
var parseFields = function(fieldParams){
  if(!utils.isPlainObject(fieldParams)){
    fieldParams = {}
  }
  var parameters = {}

  utils.keys(fieldParams).map(function(key){
    var value = fieldParams[key]

    if(value.length > 1) {
      parameters[key] = value
    }
    else {
      parameters[key] = value[0]
    }
  })
  return parameters
}

/* istanbul ignore next */
var handleNestedParameters = function(parameters){  
  var finalParameters = {}
  var parameterKeys   = utils.keys(parameters)
  var queryString     = ""

  parameterKeys.map(function(key){    
    queryString += key + "=" + key + "&"    
  })

  var jsonFormatedQs = qsNew.parse(queryString)
  finalParameters    = iterateHash(jsonFormatedQs, parameters)
 
  return finalParameters
}

/* istanbul ignore next */
var multipart = function(req, res, next) {
  if (req._body) {
    return next()
  }
    
  req.files = req.files || {}

  if (!hasBody(req)) {
    return next()
  }

  if ("GET" == req.method || "HEAD" == req.method) {
    return next()
  }

  if ("multipart/form-data" != mime(req)) {
    return next()
  }

  req._body = true
  var form  = new multiparty.Form()

  try{
    form.parse(req, function(err, fields, files) {
      if (err){
        return res.status(422).json({
          error_message: "Please send a valid multiparty/form-data payload"
        })  
      }

      req.files = files

      /* eslint-disable-next-line */
      utils.forEach(req.files, function(files, key){      
        var modifiedFiles = utils.remove(files, function(file) {
          if(file.size <= 0 && utils.isEmpty(file.originalFilename)){
            return file
          }       
        })
        key = modifiedFiles   
      })

      req.payload = utils.extend({}, req.query, parseFields(req.files), parseFields(fields))
      req.payload = handleNestedParameters(req.payload)

      // PARAM support
      if (req.payload.PARAM) {
        var PARAM = {}
        try {
          PARAM = JSON.parse(req.payload.PARAM)
        } catch(e) {
          // skip catch block
        }

        utils.merge(req.payload, PARAM)
      }
      next()
    })
  }
  catch(e){
    // if content-type missing the boundary field in form-data
    // eg multipart/form-data; boundary=----WebKitFormBoundaryLO9DHJ3wX1ACYcuq
    return res.status(422).json({
      error_message: "Please send a valid multiparty/form-data payload"
    }) 
  }
}

/* istanbul ignore next */
module.exports = function(req, res, next) {
  if (mime(req) === "multipart/form-data") {
    return multipart(req, res, next)
  }
  
  if(req.query.query){
    try{
      req.query.query = JSON.parse(req.query.query)
    }
    catch(e){
      // skip catch block
    }
  }

  if(req.query.options){
    try{
      req.query.options = JSON.parse(req.query.options)
    }
    catch(e){
      // skip catch block
    }
  }

  req.payload = utils.extend({}, req.query, req.body)

  if (req.payload.PARAM) {
    var PARAM = {}

    try {
      PARAM = JSON.parse(req.payload.PARAM)
    } catch(e) {
      // skip catch block
    }

    req.payload = utils.extend(req.payload, PARAM)
  }
  next()
}