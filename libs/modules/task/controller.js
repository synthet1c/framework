var
	Task       = require( './model' ),
	TaskSchema = require( './schema' ),
	Route      = require( LIB_DIR + 'route' );

module.exports = {

	/** GET resource */
	index: function( req, res, Template, Auth, Route ){
		return function(){

			Auth.secure( 'andrew', function( taskObj ){

				Task
					.all()
					.toArray( function( tasks ){
						Template.add( { tasks: tasks } );
						res.end( Template.send() );
					} );

			} );
		}
	},

	/** GET resource/create */
	create: function( req, res, Template, Auth ){
		return function(){

			Auth.token( function( token ){

				Template.add( { token: token } );
				res.end( Template.send() );

			} );
		}
	},

	/** GET resource/:id */
	show: function( req, res, Template, Auth ){
		return function( id ){

			Task
				.where( { url: id || req.params.url } )
				.toInstance( function( task ){
					Template.add( task );
					var template = Template.send();
					return res.end( template );
				} );
		}
	},

	/** PUT resource {Object<params>} */
	store: function( req, res, Auth ){
		return function( params ){
			var self = this;

			Auth.check( req.params.token, function( err ){

				if( err ) return res.end( err );

				var params = extend( req.params, {
					url: req.params.name.replace(/\s+/, '-')
				});

				Task.create( params )
					.save( function( record ){
						return self.redirect( req, res, 'task.show', record.url );
					});

			} );
		}
	},

	/** GET resource/:id */
	edit: function( req, res, Template ){
		return function( id ){
			console.log( 'TaskCtrl.edit', arguments );
		}
	},

	/** PUT/PATCH resource/:id */
	update: function( req, res, Template ){
		return function( id ){
			console.log( 'TaskCtrl.update', arguments );
		}
	},

	/** DELETE resource/:id/destroy */
	destroy: function( req, res ){
		return function( _id ){
			console.log( 'TaskCtrl.destroy' );

			var Route = this;

			if( !req.params.destroy ){
				throw new Error( 'no _id provided' );
			}

			Task.destroy( req.params.destroy, function( result ){
				Route.redirect( req, res, 'task.index', {} );
			} );
		}
	},

	tasks: function( req, res, Template ){
		return function( task ){

			Template.add({
				task: task
			});
			var template = Template.send();
			return res.end( template );

		}
	},

	task: function( req, res, Template ){
		return function( task, task ){

			Template.add({
				task: task,
				task   : task
			});
			var template = Template.send();
			return res.end( template );

		}
	},

	/** PUT resource {Object<params>} */
	taskstore: function( req, res, Auth ){
		return function( params ){
			var self = this;

			Auth.check( req.params.token, function( err ){

				if( err ) return res.end( err );

				var params = extend( req.params, {
					url: req.params.name.replace( /\s+/, '-' )
				});

				Task.create( params )
					.save( function( record ){
						return self.redirect( req, res, 'task.show', record.url );
					} );

			} );
		}
	}
};