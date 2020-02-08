'use strict';

const uuidv4 = require('uuid/v4');
const uniqueString = require('unique-string');

var context = require('./../../app');

var utilsService = require('./../services/utils_service');

module.exports = {
  generateSsa: generateSsa,
  generateDcrRequest: generateDcrRequest,
  generateClientAssertion: generateClientAssertion,
  generateAuthorizeUri: generateAuthorizeUri,
  generateCodeAssertion: generateCodeAssertion
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function generateSsa(req, res) {
  
  req.body.jti = uuidv4();
  // req.body.software_id = uniqueString();
  req.body.software_id = req.body.client_name.replace(/[^a-zA-Z]/g, "");
  console.log("Software ID: " + req.body.software_id);

  utilsService.generateSsa(
      req.body,
      context.app.get('ALGORITHM'),
      context.app.get('EXPIRATION'),
      context.app.get('SSA_KID_VALUE')
    ).then(function (data){
      res.json({ data: data });
    }).catch(function (err){
      console.log(err);
      res.json({ message: err });
    });
}

function generateDcrRequest(req, res) {
  
  req.body.jti = uuidv4();
  req.body.token_endpoint_auth_signing_alg = context.app.get('ALGORITHM');
  req.body.token_endpoint_auth_method = context.app.get('AUTH_METHOD')
  req.body.id_token_signed_response_alg = context.app.get('ALGORITHM');
  req.body.request_object_signing_alg = context.app.get('ALGORITHM');

  utilsService.generateDcrRequest(
    req.body,
    context.app.get('ALGORITHM'),
    context.app.get('EXPIRATION'),
    context.app.get('DCR_KID_VALUE')
  ).then(function (data){
    res.json({ data: data });
  }).catch(function (err){
    console.log(err);
    res.json({ message: err });
  });
}

function generateClientAssertion(req, res) {

  req.body.jti = uuidv4();
  req.body.sub = req.body.iss;

  utilsService.generateDcrRequest(
    req.body,
    context.app.get('ASSERTION_ALGORITHM'),
    context.app.get('EXPIRATION'),
    context.app.get('DCR_KID_VALUE')
  ).then(function (data){
    res.json({ data: data });
  }).catch(function (err){
    console.log(err);
    res.json({ message: err });
  });
}

function generateAuthorizeUri(req, res) {

  req.body.iss = req.body.client_id;
  req.body.nonce = uuidv4();

  utilsService.generateAuthorizeUri(
    req.body,
    context.app.get('ASSERTION_ALGORITHM'),
    context.app.get('EXPIRATION'),
    context.app.get('DCR_KID_VALUE')
  ).then(function (data){
    //prompt=login to always pop login screen
    var uri = "https://" + context.app.get('WSO2_HOST') + ":" + context.app.get('WSO2_PORT') + "/authorize/?request=" + data + "&response_type=code%20id_token&client_id=" + req.body.client_id + "&scope=openid%20bank:accounts.basic :read%20bank:accounts.detail:read%20bank:transactions:read%20bank:payees:re ad%20bank:regular_payments:read%20common:customer.basic:read%20common :customer.detail:read&redirect_uri=" + req.body.redirect_uri + "&prompt=login";
    res.json({ data: uri });
  }).catch(function (err){
    console.log(err);
    res.json({ message: err });
  });
}

function generateCodeAssertion(req, res) {

  req.body.jti = uuidv4();
  req.body.sub = req.body.iss;

  utilsService.generateDcrRequest(
    req.body,
    context.app.get('ASSERTION_ALGORITHM'),
    context.app.get('EXPIRATION'),
    context.app.get('DCR_KID_VALUE')
  ).then(function (data){
    res.json({ data: data });
  }).catch(function (err){
    console.log(err);
    res.json({ message: err });
  });
}
