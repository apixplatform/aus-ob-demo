'use strict';

module.exports = function(app) {

	app.set('ALGORITHM', process.env.EXPIRATION || 'PS256');
	app.set('AUTH_METHOD', process.env.EXPIRATION || 'private_key_jwt');
	app.set('EXPIRATION', process.env.EXPIRATION || '3600');
	app.set('ASSERTION_ALGORITHM', process.env.EXPIRATION || 'RS256');

	app.set('SSA_KID_VALUE', process.env.SSA_KID_VALUE || 'b8facf2ff39444f781e0be5db4b14f16');
	app.set('DCR_KID_VALUE', process.env.SSA_KID_VALUE || 'xII5m7uKSgSBsDlhARywqVco7IE');
};
