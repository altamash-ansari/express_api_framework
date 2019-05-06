module.exports = {
  "/v1": {
    GET(req, res){
      return this.resSuccess(req, res, {
        notice: "HELLO from GET"
      })
    },
    POST(req, res){
      return this.resSuccess(req, res, {
        notice: "HELLO from POST"
      })
    }
  }
}