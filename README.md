# express_api_framework
API framework based on expressjs

# Setup Step
``` 
  npm install
```

### API Framework is a generic server framework build on top of ExpressJS. It supports bodyparser and multiparty express middleware.

#### API server is based on the config file from where it picks the port number and other required values to get started.

The config is based on the NODE_ENV variable.

` To set the NODE_ENV input the following in terminal `
  
``` 
  export NODE_ENV=localdev
```

` To start/restart/reload/stop the API server, execute the following command `

```
  npm run start 
  npm run restart 
  npm run reload // for gracefull restart
  npm run stop
```

## Folder Structure of Modules

```
  |- api-server
    |- services
      |- {{service_name}}
          |- index.js // required, Initialization of config and translations
          |- routes.js // required
          |- config.js // optional
          |- constant.json // optional
          |- package.json
          |- controllers // Contains routes controllers
          |- models // Contains mongoose models
          |- resources // Contains error translation and codes
          |- test // Contains tests suite
      |- {{another_service_name}}
          |- ...
```

## Note:

Sample boilerplate for module is availabe in folder <b>'/api-server/services/service1'</b>.

# Global Properties

API framework contain global variables and methods which can be accessed in the code.

```
  1. app // Express app instance

  2. app.config.get(key) // Used to fetch the config value based on keys e.g., app.config.get("port")

  3. app.mergeConfig // Combines the new module config with the API framework config e.g., app.mergeConfig("config-name", config-json)

  4. app.logger // Winston instance

  5. utils // Contain helper functions
```