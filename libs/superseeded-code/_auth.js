var
	SESSIONS    = {},
	Request     = require('./request'),
	Response    = require('./response'),
	User        = require('./modules/user/model' ),
	Route       = require('./route');

module.exports = Auth;

function Auth( req, res ){

	var _private = {};

	// create a private getter / setter
	this.$private = function( cb ){
		return cb.call( _private, _private );
	};

	extend( _private, {
		req   : Request( req ),      // current request object
		res   : Response( res ),     // current response object
		socket: socket || null,      // users socket connection to push messages
		ip    : null,                // users ip address
		auth  : null,                // level of user
		token : null                 // authorization token
	});
}

extend( Auth, {

	end: function( sessionId ){
		delete SESSIONS[ sessionId ];
	},

	login: function( req, user, pass, fn ){

		User.where({user: user}, function( user ){
			return !user
				? Response.redirect('user.login', Request.params )
				: fn.call( this, user )
		});

	},

	secure: function( userObj, fn ){
		// passing a token.
		if(isString( userObj )){
			return SESSIONS[ userObj ] || Response.redirect('login');
		}

		User.where( userObj , function( user ){
			return !user
				? AuthenticationError()
				: fn.call( this, user )
		});
	},

	stale: function(){
		// check all sessions for being stale, if they are move to mongo
	}
});

function authenticationError(){
	return Route.redirect('login');
}

extend( Auth.prototype, {
	$_ : function( prop ){
		this.$private(function( _private ){
			return this[ prop ];
		});
	}
});

var userObj = {
	user: 'andrew',
	pass: 'password'
};

Auth.secure( userObj,
	function( authObj ){

		authObj.res.template('users.index');

		// do secure stuff or login
	});


function sessionID( req, user ){
	return user;
}
