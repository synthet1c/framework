var Controller = require(LIB_DIR + '\\controller');

module.exports = UserCtrl;

function UserCtrl( req, res ){
	this.req = req;
	this.res = res;
}

UserCtrl.prototype = new Controller();
extend(UserCtrl.prototype, {

	/** GET resource */
	index: function(){
		console.log( 'UserCtrl.index');
	},

	/** GET resource/create */
	create: function(){
		console.log( 'UserCtrl.create' );
	},

	/** GET resource/:id */
	show: function( id ){
		console.log( 'UserCtrl.show', arguments );
	},

	/** PUT resource/:id {Object<params>} */
	store: function( id, params ){
		console.log( 'UserCtrl.store', arguments );
	},

	/** GET resource/:id */
	edit: function( id ){
		console.log( 'UserCtrl.edit', arguments );
	},

	/** PUT/PATCH resource/:id */
	update: function( id ){
		console.log( 'UserCtrl.update', arguments );
	},

	/** DELETE resource/:id/destroy */
	destroy: function(){
		console.log( 'UserCtrl.destroy' );
	}

});