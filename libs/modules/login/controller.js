var
	User        = require( MODULE_DIR + 'user/model' ),
    Response    = require( LIB_DIR + 'response' ),
	Route       = require( LIB_DIR + 'route' ),
	Auth        = require( LIB_DIR + 'auth');

module.exports = {

	/** GET /login */
	index: function( req, res, Template ){
		return function(){

			Template.add({'user': 'andrew'});
			res.end( Template.send() );
		}
	},

	/** POST /login */
	login: function( req, res, Template, Auth ){
		return function(){

			return Auth.login( req.params.user, function( user ){

				return Route.redirect( req, res, 'user.index', user );

			});

		}
	},

	logout: function( req, res, Template, Auth, Route ){
		return function(){
			Auth.logout( req.params.token, function(){

				return Route.redirect(req, res, 'login.index');
			});
		}
	}
};