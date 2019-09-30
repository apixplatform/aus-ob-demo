const express = require('express')
var cors = require('cors');
const jwt = require('jsonwebtoken');
var rp = require('request-promise');
const fs = require('fs');

const app = express()
const port = 3000

var privateKey = fs.readFileSync('keys/private.key');
var publicKey = fs.readFileSync('keys/public.pem');

const expressSwagger = require('express-swagger-generator')(app);
const packageJson = require("./package.json");
let options = {
    swaggerDefinition: {
        info: {
            description: packageJson.description,
            title: packageJson.name,
            version: packageJson.version,
        },
        basePath: '/',
        produces: [
            "application/json"
        ],
        schemes: ['http'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./*.js'] //Path to the API handle folder
};
expressSwagger(options);

var allowedOrigins = ['*'];
if (process.env.CORS_ORIGIN) {
  allowedOrigins = process.env.CORS_ORIGIN.split(',');
}
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (allowedOrigins.indexOf('*') != -1) return callback(null, true);
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.get('/', (req, res) => {
  res.send('cdr-demo-backend is running!!!');
})

/**
 * This returns authRequest to be used for /authorize.
 * @route GET /authRequest
 * @group Demo
 * @returns {object} 200 - JWT
 * @returns {Error}  default - Unexpected error
 */
app.get('/authRequest', (req, res) => {
  var jwtBody = {
    "max_age": 86400,
    "aud": "https://18.221.135.54:8243/token",
    "scope": "openid bank:accounts.basic:read bank:accounts.detail:read bank:transactions:read bank:payees:read bank:regular_payments:read common:customer.basic:read common:customer.detail:read",
    "claims": {
      "id_token": {
        "acr": {
          "values": [
            "urn:cds.au:cdr:3"
          ],
          "essential": true
        },
        "sharing_duration": {
          "value": "7776000"
        }
      },
      "userinfo": {
        "sharing_duration": {
          "value": "7776000"
        }
      }
    },
    "response_type": "code id_token",
    "redirect_uri": "http://localhost:4200",
    "state": "YWlzcDozMTQ2",
    "nonce": "n-0S6_WzA2M",
    "client_id": "__VNF_K3ie4cG6W1yaQ9iiDI2bMa"
  }
  var token = jwt.sign(jwtBody, privateKey, { algorithm: 'PS256' });
  res.send(token);
})

/**
 * This returns clientAssertion to be used for /token.
 * @route GET /clientAssertion
 * @group Demo
 * @returns {object} 200 - JWT
 * @returns {Error}  default - Unexpected error
 */
app.get('/clientAssertion', (req, res) => {
  var jwtBody = {
    sub: "z15EytHsjcf250SkdD8uVekFCSUa",
    aud: "https://18.221.135.54:8243/token",
    iss: "z15EytHsjcf250SkdD8uVekFCSUa",
    jti: Math.round(new Date().getTime()) + ""
  }
  var header = {
    kid: "hcgexuguVb5rYSYVBsl-c9hBPvY"
  }
  var token = jwt.sign(jwtBody, privateKey, { algorithm: 'PS256', expiresIn: 24 * 60 * 60, header: header });
  res.send(token);
})

/**
 * This exchanges code and clientAssertion for a token
 * @route POST /token
 * @group Demo
 * @param {string} grant_type.query - grant_type: authorization_code
 * @param {string} scope.query - scope: openid+bank:accounts.basic:read+bank:accounts.detail:read+bank:transactions:read+bank:payees:read+bank:regular_payments:read+common:customer.basic:read+common:customer.detail:read
 * @param {string} client_assertion_type.query - client_assertion_type: urn:ietf:params:oauth:client-assertion-type:jwt-bearer
 * @param {string} client_assertion.query - client_assertion
 * @param {string} redirect_uri.query - redirect_uri - http://localhost:4200/accounts
 * @param {string} code.query - code
 * @returns {object} 200 - JSON
 * @returns {Error}  default - Unexpected error
 */
app.post('/token', (req, res) => {

  var options = {
    method: 'POST',
    uri: 'https://18.221.135.54:8243/token',
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

/**
 * This returns authorize URL
 * @route GET /authorizeUrl
 * @group Demo
 * @returns {object} 200 - URL
 * @returns {Error}  default - Unexpected error
 */
app.get('/authorizeUrl', (req, res) => {
  var request = "eyJraWQiOiJoY2dleHVndVZiNXJZU1lWQnNsLWM5aEJQdlkiLCJhbGciOiJQUzI1NiJ9.eyJtYXhfYWdlIjo4NjQwMCwiYXVkIjoiaHR0cHM6XC9cLzE4LjIyMS4xMzUuNTQ6ODI0M1wvdG9rZW4iLCJzY29wZSI6Im9wZW5pZCBiYW5rOmFjY291bnRzLmJhc2ljOnJlYWQgYmFuazphY2NvdW50cy5kZXRhaWw6cmVhZCBiYW5rOnRyYW5zYWN0aW9uczpyZWFkIGJhbms6cGF5ZWVzOnJlYWQgYmFuazpyZWd1bGFyX3BheW1lbnRzOnJlYWQgY29tbW9uOmN1c3RvbWVyLmJhc2ljOnJlYWQgY29tbW9uOmN1c3RvbWVyLmRldGFpbDpyZWFkIiwiY2xhaW1zIjp7ImlkX3Rva2VuIjp7ImFjciI6eyJ2YWx1ZXMiOlsidXJuOmNkcy5hdTpjZHI6MyJdLCJlc3NlbnRpYWwiOnRydWV9LCJzaGFyaW5nX2R1cmF0aW9uIjp7InZhbHVlIjoiNzc3NjAwMCJ9fSwidXNlcmluZm8iOnsic2hhcmluZ19kdXJhdGlvbiI6eyJ2YWx1ZSI6Ijc3NzYwMDAifX19LCJyZXNwb25zZV90eXBlIjoiY29kZSBpZF90b2tlbiIsInJlZGlyZWN0X3VyaSI6Imh0dHA6XC9cL2xvY2FsaG9zdDo0MjAwXC9hY2NvdW50cyIsInN0YXRlIjoiWVdsemNEb3pNVFEyIiwibm9uY2UiOiJuLTBTNl9XekEyTSIsImNsaWVudF9pZCI6InoxNUV5dEhzamNmMjUwU2tkRDh1VmVrRkNTVWEifQ.daAVLYUz5lDgVWJJe0JDgLgSXXd4Run7htOIIwGRSkWgFfHKSd5lUjHRIw7Q85ahLudb0BRxsJaMgHNdw-DLsUYFvhYOkTV050n35woTquD_3Tr23J_dpC1VuXbDIs04PN15K0WNrbK41GeUwpe0VvCBbj23GxB49jGkwbVf8ir3eUmreLGxkYGfkm_sgDmFHVQbvbrAR2Sd3oP6GyQwkzk1NZ37g5JZeUCTsqFcCC4gkdAOkLgF8ljOES5tESSfchhUkHd1hm0LX968nakxUVgfHc7oUYKcN7sxjWqMOPB7y_pwbpWwSXT6VQ9W2IhjspXSYGPuZ6T6p6LBuglQcQ";
  var scope = "openid bank:accounts.basic:read bank:accounts.detail:read bank:transactions:read bank:payees:read bank:regular_payments:read common:customer.basic:read common:customer.detail:read"
  var url = `https://18.221.135.54:8243/authorize/?request=${request}&response_type=code%20id_token&client_id=z15EytHsjcf250SkdD8uVekFCSUa&scope=${scope}&redirect_uri=http://localhost:4200/accounts  `
  res.send(url);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))