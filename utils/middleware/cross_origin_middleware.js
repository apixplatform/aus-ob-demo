'use strict';

module.exports = function(app) {

	// Set CORS and header parameters
	var allowCrossDomain = function(req, res, next) {       
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');        
        next();
	};
	app.use(allowCrossDomain);
};
