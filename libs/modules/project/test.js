
(function( req, res, Template ){
	return function( slug ){

		Project
			.where({ slug: slug })
			.members()
			.client()
			.tasks()
			.toInstance( function( project ){

				return Template.send( project );

			});
	}

})();