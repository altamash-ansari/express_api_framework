const _    = require("lodash")

module.exports = _

module.exports.Promise          = require("when")
module.exports.Promise.sequence = require("when/sequence")
module.exports.Promise.pipeline = require("when/pipeline")
module.exports.Promise.parallel = require("when/parallel")