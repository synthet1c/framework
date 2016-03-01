var
	elegant = require( LIB_DIR + 'model'),
    Template = require( LIB_DIR + 'Template' );

/**
 * User model inherits all of the generic model functionality
 * through elegant.
 */
var User = elegant(
	/**
	 * @constructor
	 *
	 * @param {Object}    props    properties to inherit
	 */
	function User( props ){
		this.__proto__.constructor.call( this );
	},
	/**
	 * @instance
	 */
	function user(){},
	/**
	 * @prototype methods
	 *
	 * Object instances will inherit these methods when they are
	 * pulled from mongo and created with their model.
	 *
	 * **prototype methods are fluent by default**
	 */
	{
		posts: elegant.hasMany( 'Post', '_id', 'author' ),
		profile: elegant.hasOne( 'Profile' ),
		sites  : elegant.belongsToMany( 'Site' )
	},
	/**
	 * @errorHandlers
	 *
	 * Error handlers for getting and setting data from mongo.
	 * if none are specified the default error will be used
	 */
	{
		set: function setErrorHandler( err ){
			return new Error( 'problem inserting data', err );
		},
		get: function getErrorHandler( err ){
			return new Error( 'problem getting data', err );
		}
	}
);

module.exports = User;


var Model = elegant(
	function Model( props ){
		this.__proto__.constructor.call( this );
	},
	function model(){},
	{
		// methods to inherit into model
	},
	{
		// error functions
	}
);