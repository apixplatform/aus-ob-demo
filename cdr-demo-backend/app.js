'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./api/swagger/swagger.json');
var rp = require('request-promise');

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/token', (req, res) => {

  var options = {
    method: 'POST',
    uri: "https://" + app.get('WSO2_HOST') + ":" + app.get('WSO2_PORT') + "/token",
    qs: {
      grant_type: req.query.grant_type,
      scope: req.query.scope,
      client_assertion_type: req.query.client_assertion_type,
      client_assertion: req.query.client_assertion,
      redirect_uri: req.query.redirect_uri,
      code: req.query.code
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    insecure: true,
    rejectUnauthorized: false,
    json: true // Automatically parses the JSON string in the response
  };

  rp(options)
    .then(function (body) {
      res.send(body)
    })
    .catch(function (err) {
      res.status(err.statusCode).send(err.error);
      // console.log(err);
      // API call failed...
    });


  // res.send(token);
})

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('Server running on ' + port);
  }
});
