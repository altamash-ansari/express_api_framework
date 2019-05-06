module.exports = function(req, res, next) {
  res.setHeader("X-Powered-By", "Express_API_Framework")
  next()
}