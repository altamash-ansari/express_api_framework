module.exports = {
  "/hooks": {
    GET: {
      // eslint-disable-next-line no-unused-vars
      _pre(req, res){
        req.obj[req.hookCallCount] = "hello from service2 pre hook"

        ++req.hookCallCount

        return utils.Promise.resolve(req)
      },
      // eslint-disable-next-line no-unused-vars
      _post(req, res){  
        req.obj[req.hookCallCount] = "hello from service2 post hook"

        ++req.hookCallCount
        return utils.Promise.resolve(req)
      }
    }
  }
}