const fs = require("fs")

/* istanbul ignore next */
function listDir(dir) {
  return fs.readdirSync(dir)
}

/* istanbul ignore next */
function isDirectory(file) {
  var stat = fs.statSync(file)
  return stat && stat.isDirectory()
}

/* istanbul ignore next */
function getJsFiles(files) {
  return files.filter(function(f) {return f.match(/.js$/)})
}

/* istanbul ignore next */
function isJsFile(f){
  return f.match(/.js$/)
}

/* istanbul ignore next */
function path(dir, file) {
  return dir + "/" + file
}

/*
  Simple function to traverse and require the JS files
*/
/* istanbul ignore next */
function traverseAndRequire(dir) {
  if (!fs.existsSync(dir))
    return

  var files = listDir(dir)
  getJsFiles(files).forEach(function(file) {
    require(path(dir, file))
  })

  files.forEach(function(file) {
    file = path(dir, file)
    if (isDirectory(file))
      return traverseAndRequire(file)
  })
}

/* istanbul ignore next */
function traverseAndReturnJSFileNames(dir){
  if (!fs.existsSync(dir))
    return

  const files = listDir(dir)

  return files.map(function(file) {
    file = path(dir, file)

    if(isJsFile(file)){
      return file
    }

    if (isDirectory(file))
      return traverseAndReturnJSFileNames(file)
    
  })
}

exports.isDirectory                  = isDirectory
exports.getJsFiles                   = getJsFiles
exports.listDir                      = listDir
exports.traverseAndRequire           = traverseAndRequire
exports.traverseAndReturnJSFileNames = traverseAndReturnJSFileNames
exports.path                         = path