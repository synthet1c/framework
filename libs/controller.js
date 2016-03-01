module.exports = Controller;

var Router = require( LIB_DIR + '\\route' );

function Controller( Model, model ){
	this.Model = Model;
	this.model = model;
}

Controller.prototype = {

	init: function( req, res ){

	},

	/** GET resource */
	index: function(){

	},

	/** GET resource/create */
	create: function(){

	},

	/** GET resource/:id */
	show: function( id ){

	},

	/** PUT resource/:id {Object<params>} */
	store: function( id, params ){

	},

	/** GET resource/:id */
	edit: function( id ){

	},

	/** PUT/PATCH resource/:id */
	update: function( id ){

	},

	/** DELETE resource/:id/destroy */
	destroy: function(){

	}

};