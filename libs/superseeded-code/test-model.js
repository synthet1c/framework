function Model( query, special ){
	this.query      = query;
	this.special    = special;
}

extend( Model, {
	where: function( query, special ){
		return new this( query, special );
	}
});

extend( Model.prototype, {
	get: fluent(function( /* columns... */){
		var columns = Array.prototype.slice.call( columns );


	}),
	success: function( fn ){

	},
	attach: function( model, foreignKey ){

	}
});

function elegant(){

	var model = function(){

	};
	model.prototype = new Model();

	var shared = {
		$collection: collection(function(){

		})
	};

	extend( model.prototype , shared, {

	});

	extend( model, shared, {

	});

	return model;

}


var Post = elegant({
	proto: {
		user: elegant.belongsTo('User', 'author')
	},
	shared: {

	}
});

extend( elegant, {
	belongsTo: function belongsTo( model, foreign, primary ){

		var
			parent = this,
		    child;

		return function( /*columns...*/ ){
			this[ lc( model ) ] = function(){
				var columns = Array.prototype.slice.call( arguments, 0 );

			}
		}

	}
});''

var ids = ['asthaustehstsha', 'astuhsaetnouht'];

	Post
		.where({_id : { $in: ids }})
		.user('name', 'age')
		.error(genericError)
		.success( Response.end );