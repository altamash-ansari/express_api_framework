module.exports = function(req, res, next) {
  function mime(req) {
    var str = req.headers["content-type"] || ""
    return str.split(";")[0]
  }

  function isPutPostRequest(req) {
    return (req.method === "POST" || req.method === "PUT")
  }

  function hasBody(req) {
    var encoding = "transfer-encoding" in req.headers
    var length   = "content-length" in req.headers && req.headers["content-length"] !== "0"
    return encoding || length
  }

  // In request body built supports only 'multipart/form-data' and 'application/json' so if is 'text/plain' invalid
  var isContentTypeInValid = function(req) {
    if(hasBody(req)) {
      return (isPutPostRequest(req) && (mime(req) === "" || mime(req) === "text/plain"))
    }
    return false
  }

  // Request contains multipart/form-data
  if (mime(req) === "multipart/form-data") {
    return next()
  }

  if(isContentTypeInValid(req)) {
    return res.status(400).json({
      error_message: "Please set a valid 'Content-Type' header"
    })
  }

  next()
}