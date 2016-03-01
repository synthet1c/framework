/**
 * this module holds the relationships for the Model class
 * Model is to be a prototype of ModelRelationship to inherit
 * all of it's functionality
 *
 * @package     relationship-model
 * @exports     {ModelRelationships, RelationshipModel}
 */

function ModelRelationships(){}

var RelationshipModel = {

	/**
	 * links models with one to many relationship
	 *
	 * @param    {bool}    bind    bind to `this` or return function
	 *
	 * @returns {Function}    hasMany
	 *      @param    {string}    model        model to link relationship
	 *      @param    {string}    foreignKey    foreignKey for the relationship
	 *      @param    {string}    primaryKey    primary key for the relationship
	 *
	 *        @returns {Function} _hasMany    curried helper function
	 */
	hasMany: function( bind ){

		return function hasMany( model, foreignKey, primaryKey ){

			var _model = lc( model );

			if( !bind ) return _hasMany;

			this[ _model ] = _hasMany;

			function _hasMany(){

				foreignKey = _model + '.' + (foreignKey || 'id');
				primaryKey = lc( this.$model ) + '.' + (primaryKey || 'id');

				console.log( 'accessed ' + model );
				console.log( 'JOIN ON ' + foreignKey + ' = ' + primaryKey )
			}
		}
	},

	/**
	 * links models with one to many relationship
	 *
	 * @param    {bool}    bind    bind to `this` or return function
	 *
	 * @returns {Function}    hasMany
	 *      @param    {string}    model        model to link relationship
	 *      @param    {string}    foreignKey    foreignKey for the relationship
	 *      @param    {string}    primaryKey    primary key for the relationship
	 *
	 *        @returns {Function} _hasMany    curried helper function
	 */
	hasOne: function( bind ){

		return function hasOne( model, foreignKey, primaryKey ){

			var _model = lc( model );

			if( !bind ) return _hasOne;

			this[ _model ] = _hasOne;

			function _hasOne(){

				foreignKey = _model + 's.' + (foreignKey || 'id');
				primaryKey = lc( this.$model ) + 's.' + (primaryKey || 'id');

				console.log( 'accessed ' + model );
				console.log( 'JOIN ON ' + foreignKey + ' = ' + primaryKey );
			}
		}
	},

	/**
	 * links models with many to many relationship
	 * @param model
	 */
	belongsToMany: function( bind ){

		return function belongsToMany( model, foreignKey, primaryKey ){

			var _model = lc( model );

			if( bind ){
				this[ _model ] = _belongsToMany;
			}

			return _belongsToMany;

			function _belongsToMany(){

				foreignKey = _model + 's.' + (foreignKey || 'id');
				primaryKey = lc( this.$model ) + 's.' + (primaryKey || 'id');

				console.log( 'accessed ' + model );
				console.log( 'SELECT * FROM ' + _model + 's WHERE ' + foreignKey + ' IN(SELECT ' + primaryKey + ' FROM ' + lc( this.$model ) + 's)' );
			}
		}
	}
};

ModelRelationships.prototype = {

	/**
	 * links models with one to many relationship
	 *
	 * @param    {bool}    bind    bind to this obj
	 *
	 * @returns ModelRelationship.hasMany
	 */
	hasMany: RelationshipModel.hasMany( true ),

	/**
	 * links models with a one to one relationship
	 *
	 * @param    {bool}    bind    bind to this obj
	 *
	 * @returns ModelRelationship.hasOne
	 */
	hasOne: RelationshipModel.hasOne( true ),

	/**
	 * links models with many to many relationship
	 *
	 * @param    {bool}    bind    bind to this obj
	 *
	 * @returns ModelRelationship.belongsToMany
	 */
	belongsToMany: RelationshipModel.belongsToMany( true )
};

function lc( str ){
	return str.toLowerCase();
}

module.exports = {
	ModelRelationships: ModelRelationships,
	RelationshipModel : RelationshipModel
};