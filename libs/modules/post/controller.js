var
	User        = require( MODULE_DIR + '/user/model'),
	Post        = require('./model');

module.exports = {

	/** GET resource */
	index: function( req, res, Template ){
		return function(){

			Post
				.exists('post')
				.all()
				.author()
				.toArray(function( posts ){

					Template.add({posts: posts});
					res.end( Template.send() );

				});
		}
	},

	/** GET resource/create */
	create: function( req, res, Template ){
		return function(){
			console.log( 'PostCtrl.create' );

			// res.statusCode = 200;
			// res.setHeader( 'Content-Type', 'text/html' );
			res.end( Template.send() );
		}
	},

	/** GET resource/:id */
	show: function( req, res, Template ){
		return function( id ){

			User
				.where({first: id})
				.toObject(function( user ){

					Post
						.where({author: user._id})
						.attach({author: user})
						.toArray( function( posts ){

							Template.add({
								posts: posts
							});

							res.end( Template.send() );

						});
				});
		}
	},

	/** PUT resource {Object<params>} */
	store: function( req, res, Template ){
		return function( params ){
			var self = this;
			console.log( 'PostCtrl.store' );

			var post = new Post( req.params );

			post.save(function( record ){
				return self.redirect( req, res, 'post', 'show', record );
			});
		}
	},

	/** GET resource/:id */
	edit: function( req, res, Template ){
		return function( id ){
			console.log( 'PostCtrl.edit', arguments );
		}
	},

	/** PUT/PATCH resource/:id */
	update: function( req, res, Template ){
		return function( id ){
			console.log( 'PostCtrl.update', arguments );
		}
	},

	/** DELETE resource/:id/destroy */
	destroy: function( req, res ){
		return function( _id ){
			console.log( 'PostCtrl.destroy' );

			var Route = this;

			Post.destroy(req.params.destroy, function( result ){
				console.log( 'destroyed post', result );

				Route.redirect( req, res, 'post', 'index', {} );
			});
		}
	}
};