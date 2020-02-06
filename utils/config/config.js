'use strict';

module.exports = function(app) {

	app.set('ALGORITHM', process.env.ALGORITHM || 'PS256');
	app.set('AUTH_METHOD', process.env.AUTH_METHOD || 'private_key_jwt');
	app.set('EXPIRATION', process.env.EXPIRATION || '3600');
	app.set('ASSERTION_ALGORITHM', process.env.ASSERTION_ALGORITHM || 'RS256');
	app.set('WSO2_HOST', process.env.WSO2_HOST || 'cua.wso2support.com');
	app.set('WSO2_PORT', process.env.WSO2_PORT || '8243');
	
	app.set('SSA_KID_VALUE', process.env.SSA_KID_VALUE || 'b8facf2ff39444f781e0be5db4b14f16');
	app.set('DCR_KID_VALUE', process.env.DCR_KID_VALUE || 'xII5m7uKSgSBsDlhARywqVco7IE');
};
