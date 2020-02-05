'use strict';

var jwt = require('jsonwebtoken');

var context = require('./../../app');
var privateKey = context.privateKey;
var wso2PrivateKey = context.wso2PrivateKey;

module.exports = {
    generateSsa: generateSsa,
    generateDcrRequest: generateDcrRequest,
    generateClientAssertion: generateClientAssertion,
    generateAuthorizeUri: generateAuthorizeUri
};

function generateSsa(body, algorithm, expiration, kid) {

  return new Promise(function (resolve, reject) {


    var options = {
        algorithm: algorithm, 
        expiresIn: Number(expiration), 
        header: { 
            kid: kid 
        }
    };

    var token = jwt.sign(body, privateKey, options);
    return resolve(token);
  }); 
}

function generateDcrRequest(body, algorithm, expiration, kid) {

    return new Promise(function (resolve, reject) {
  
      var options = {
          algorithm: algorithm, 
          expiresIn: Number(expiration), 
          header: { 
              kid: kid 
          }
      };
  
      var token = jwt.sign(body, wso2PrivateKey, options);
      return resolve(token);
    }); 
}

function generateClientAssertion(body, algorithm, expiration, kid) {

    return new Promise(function (resolve, reject) {
  
      var options = {
          algorithm: algorithm, 
          expiresIn: Number(expiration), 
          header: { 
              kid: kid 
          }
      };
  
      var token = jwt.sign(body, wso2PrivateKey, options);
      return resolve(token);
    }); 
}

function generateAuthorizeUri(body, algorithm, expiration, kid) {

    return new Promise(function (resolve, reject) {
  
      var options = {
          algorithm: algorithm, 
          expiresIn: Number(expiration), 
          header: { 
              kid: kid 
          }
      };
  
      var token = jwt.sign(body, wso2PrivateKey, options);
      return resolve(token);
    }); 
}