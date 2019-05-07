module.exports = {
  GET(req, res){
    return this.resSuccess(req, res, {
      notice: "HELLO from GET"
    })
  },
  POST(req, res){
    return this.resSuccess(req, res, {
      notice: "HELLO from POST"
    })
  },
  "/hooks": {
    GET: {
      // eslint-disable-next-line no-unused-vars
      _pre(req, res){
        req.hookCallCount = 0
        req.obj = {
          [req.hookCallCount]: "hello from service1 pre hook"
        }

        ++req.hookCallCount

        return utils.Promise.resolve(req)
      },
      // eslint-disable-next-line no-unused-vars
      _post(req, res){  
        req.obj[req.hookCallCount] = "hello from service1 post hook"

        ++req.hookCallCount
        return utils.Promise.resolve(req)
      },
      _send(req, res){
        return this.resSuccess(req, res, {
          result       : req.obj,
          hookCallCount: req.hookCallCount
        })
      }
    }
  }
}