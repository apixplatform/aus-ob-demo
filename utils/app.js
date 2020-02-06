'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();

var fs = require('fs');

// CORS
require('./middleware/cross_origin_middleware')(app);

// Config
require('./config/config')(app);

// for testing
module.exports = {
  app: app,
  privateKey : fs.readFileSync('./resources/rsa_private.pem'),
  wso2PrivateKey : fs.readFileSync('./resources/rsa_private_wso2.pem')
};

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('Server running on ' + port);
  }
});
