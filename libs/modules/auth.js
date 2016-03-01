var
	db      = require( LIB_DIR + '//db' ),
	USERS   = {};

module.exports = {
	login: function( id, passord ){
		if (USERS[ id ]) return true;

		db.find( id, function( users ){
			if( users[0].password === password ){
				USERS[ users[0]._id ] = users[0];
			}
		});
	},
	check: function(){
		return USERS[ user ] != undefined;
	},
	logout: function( user ){
		delete USERS[ user ];
		return true;
	}
};