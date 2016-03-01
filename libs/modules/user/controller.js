var
	User        = require('./model'),
	UserSchema  = require('./schema' ),
	Route       = require(LIB_DIR + 'route');

module.exports = {

	/** GET resource */
	index: function( req, res, Template, Auth, Route ){
		return function(){

			Auth.secure( 'andrew', function( userObj ){

				User
					.all()
					.toArray( function( users ){
						Template.add( { users: users } );
						res.end( Template.send() );
					});

			});
		}
	},

	/** GET resource/create */
	create: function( req, res, Template, Auth ){
		return function(){

			Auth.token( function( token ){

				Template.add({ token: token });
				res.end( Template.send() );

			});
		}
	},

	/** GET resource/:id */
	show: function( req, res, Template, Auth ){
		return function( id ){

			User
				.where( { first: id || req.params.first } )
				.posts()
				.toInstance(function( user ){
					Template.add( user );
					var template = Template.send();
					return res.end( template );
				});
		}
	},

	/** PUT resource {Object<params>} */
	store: function( req, res, Auth ){
		return function( params ){
			var self = this;
''
			Auth.check(req.params.token, function( err ){

				if( err ) return res.end( err );

				User.create( req.params )
					.save( function( record ){
						return self.redirect( req, res, 'user.show', record.first );
					});

			});
		}
	},

	/** GET resource/:id */
	edit: function( req, res, Template ){
		return function( id ){
			console.log( 'UserCtrl.edit', arguments );
		}
	},

	/** PUT/PATCH resource/:id */
	update: function( req, res, Template ){
		return function( id ){
			console.log( 'UserCtrl.update', arguments );
		}
	},

	/** DELETE resource/:id/destroy */
	destroy: function( req, res ){
		return function( _id ){
			console.log( 'UserCtrl.destroy' );

			var Route = this;

			if( !req.params.destroy ){
				throw new Error('no _id provided');
			}

			User.destroy( req.params.destroy, function( result ){
				Route.redirect( req, res, 'user.index', {} );
			});
		}
	}
};