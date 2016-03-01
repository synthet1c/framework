var
	Product        = require('./model'),
	ProductSchema  = require('./schema' ),
	Route       = require(LIB_DIR + 'route');

module.exports = {

	/** GET resource */
	index: function( req, res, Template ){
		return function(){

			Product
				.all()
				.toArray( function( products ){
					Template.add( { products: products } );
					res.end( Template.send() );
				})
		}
	},

	/** GET resource/create */
	create: function( req, res, Template ){
		return function(){

			res.end( Template.send() );
		}
	},

	/** GET resource/:id */
	show: function( req, res, Template ){
		return function( link ){

			Product
				.where( { link: link } )
				.toInstance(function( product ){
					Template.add( {product: product} );
					return res.end( Template.send() );
				});
		}
	},

	/** PUT resource {Object<params>} */
	store: function( req, res, Template ){
		return function( params ){
			var self = this;

			var user = Product.create( req.params );

			user.save(function( record ){
				return self.redirect( req, res, 'product', 'show', record.id );
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
				Route.redirect( req, res, 'user', 'index', {} );
			});
		}
	}
};