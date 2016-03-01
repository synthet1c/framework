var Route   = require('./route' ),
    User    = require(MODULE_DIR + 'user/model' ),
    cypher  = require(LIB_DIR + 'cypher');

var SESSION = {},
    TOKENS = {};

module.exports = Auth;

function Auth( req, res ){
	this.req = req;
	this.res = res;
}

Auth.isObject = true;

extend( Auth.prototype, {
	login: function( first, cb ){

		User
			.where({first: first})
			.toObject(function( user ){
				if( user ){
					SESSION[ user.first ] = user;
					return cb.call( this, null, user );
				}
				return cb.call( this, new Error('failed authentication'));
			});
	},
	token: function( cb ){


		var token = {
				ip: getIP( this.req ),
				timeout: Date.now() + 3600
		    },
			authToken = cypher.encrypt.json( token );
		// outputs hello world
		// console.log( cypher.decrypt.json( authToken ) );

		return cb.call( this, authToken );

	},
	check: function( token, cb ){

		var decrypted = cypher.decrypt.json( token );

		// TODO: check if valid

		return decrypted
			? cb.call(this)
			: cb.call(this, new Error('auth token invalid'))
	},
	logout: function( token, callback ){

		if( SESSION[ token ] ){
			delete SESSION[ token ];
		}

		callback();
	},
	secure: function( user, cb ){

		var self = this;

		if( isString( user )){

			if( SESSION[ user ] ){
				return cb.call( this, SESSION[ user ] );
			}
			User
				.where( {first: user} )
				.toObject( function( user ){
					if( user ){
						SESSION[ user.first ] = user;
						return cb.call( this, user );
					}
					return Route.redirect( self.req, self.res, 'login.index' );
				});
		}

		User
			.where( user )
			.toObject(function( user ){
				if( user ){
					SESSION[ user.first ] = user;
					return cb.call( this, null, user );
				}
				return cb.call( this, new Error('failed authentication'));
			});

	}
});


function getIP( req ){
	return req.headers[ 'x-forwarded-for' ] ||
	req.connection.remoteAddress ||
	req.socket.remoteAddress ||
	req.connection.socket.remoteAddress;
}