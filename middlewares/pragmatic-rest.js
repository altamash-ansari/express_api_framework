/*
  A middleware to convert the method of the request,
  if an optional header/param '_method' is given.
  This is necessary for browsers which don't have support for
  PUT, DELETE, PATCH, etc.
*/
/* istanbul ignore next */
module.exports = function(req, res, next) {
  var method = req.headers["_method"] ||
    (req.payload && req.payload["_method"])

  if (!method)
    return next()

  req.method = method.toUpperCase()
  delete req.payload._method
  
  next()
}