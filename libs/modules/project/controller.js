var
	Project       = require( './model' ),
	Task          = require('../task/model' ),
	User          = require('../user/model' ),
	ProjectSchema = require( './schema' ),
	Route         = require( LIB_DIR + 'route' );

module.exports = {

	/** GET resource */
	index: function( req, res, Template, Auth, Route ){
		return function(){

			Auth.secure( 'andrew', function( projectObj ){

				Project
					.all()
					.client()
					.toArray( function( projects ){
						Template.add( { projects: projects } );
						res.end( Template.send() );
					} );

			} );
		}
	},

	/** GET resource/create */
	create: function( req, res, Template, Auth ){
		return function(){

			Auth.token( function( token ){

				User
					.where({job: 'Web Developer'})
					.toArray(function( users ){

						Template.add( {
							token: token,
							users: users
						});
						res.end( Template.send() );

					});
			});
		}
	},

	/** GET resource/:id */
	show: function( req, res, Template, Auth ){
		return function( project ){

			Project
				.where( { url: project } )
				.client()
				.tasks()
				// .users()
				.toInstance( function( project ){

					Template.add({
						project: project
					});

					var template = Template.send();
					return res.end( template );

				});
		}
	},

	/** PUT resource {Object<params>} */
	store: function( req, res, Auth ){
		return function( params ){
			var self = this;

			Auth.check( req.params.token, function( err ){

				if( err ) return res.end( err );

				var params = extend( req.params, {
					url: req.params.name.replace(/\s+/gm, '-')
				});

				Project.create( params )
					.save( function( record ){
						return self.redirect( req, res, 'project.show', record.url );
					});

			} );
		}
	},

	/** GET resource/:id */
	edit: function( req, res, Template ){
		return function( id ){
			console.log( 'ProjectCtrl.edit', arguments );
		}
	},

	/** PUT/PATCH resource/:id */
	update: function( req, res, Template ){
		return function( id ){
			console.log( 'ProjectCtrl.update', arguments );
		}
	},

	/** DELETE resource/:id/destroy */
	destroy: function( req, res ){
		return function( _id ){
			console.log( 'ProjectCtrl.destroy' );

			var Route = this;

			if( !req.params.destroy ){
				throw new Error( 'no _id provided' );
			}

			Project.destroy( req.params.destroy, function( result ){
				Route.redirect( req, res, 'project.index', {} );
			});
		}
	},

	tasks: function( req, res, Template ){
		return function( project ){

			Project
				.where({url: project})
				.client()
				.toInstance(function(project){

					Task
						.where( { project: project.code } )
						.toArray( function( tasks ){

							Template.add({
								project: project,
								tasks   : tasks
							});

							var template = Template.send();
							return res.end( template );
						});

				});
		}
	},

	task: function( req, res, Template ){
		return function( project, task ){

			Task
				.where( { url: task } )
				.project('users')
				.toArray( function( task ){
					// TODO: can only return as array when using belongs to relationship

					Template.add({
						project: project,
						task   : task[0]
					});

					var template = Template.send();
					return res.end( template );
				});
		}
	},

	taskedit: function( req, res, Template ){
		return function( project, task ){

			Task
				.where( { url: task } )
				.project()
				.toArray( function( task ){
					// TODO: can only return as array when using belongs to relationship

					Template.add({
						project: project,
						task   : task[0]
					});

					var template = Template.send();
					return res.end( template );
				});
		}
	},

	taskupdate: function( req, res, Template ){
		return function( project, task, params ){

			Task
				.where( { url: task } )
				.project()
				.toArray( function( task ){
					// TODO: can only return as array when using belongs to relationship

					Template.add({
						project: project,
						task   : task[0]
					});

					var template = Template.send();
					return res.end( template );
				});
		}
	},

	/** GET resource/create */
	taskcreate: function( req, res, Template, Auth ){
		return function( project ){

			Auth.token( function( token ){

				Project
					.where({url: project})
					.toInstance( function( project ){

						Template.add({
							token  : token,
							project: project
						});

						res.end( Template.send() );

					});
			});
		}
	},

	/** PUT resource {Object<params>} */
	taskstore: function( req, res, Auth ){
		return function( project ){
			var self = this;

			Auth.check( req.params.token, function( err ){

				if( err ) return res.end( err );

				var params = extend( req.params, {
					url: req.params.name.replace( /\s+/gm, '-' )
				});

				Task.create( params )
					.save( function( record ){
						return self.redirect( req, res, 'project.task', [project, record.url] );
					});

			} );
		}
	}
};