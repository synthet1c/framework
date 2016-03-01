var
	elegant  = require( LIB_DIR + 'model' ),
	Template = require( LIB_DIR + 'Template' );

/**
 * User model inherits all of the generic model functionality
 * through elegant.
 */
var Project = elegant(
	/**
	 * @constructor
	 *
	 * @param {Object}    props    properties to inherit
	 */
	function Project( props ){
		this.__proto__.constructor.call( this );
	},
	/**
	 * @instance
	 */
	function project(){},
	/**
	 * @prototype methods
	 *
	 * Object instances will inherit these methods when they are'
	 * pulled from mongo and created with their model.
	 *
	 * **prototype methods are fluent by default**
	 */
	{
		tasks: elegant.hasMany('Task', 'code', 'project' ),
		users: elegant.hasMany('User', '_id', 'user.id'),
		client: elegant.hasOne('User', 'client', '_id', 'client')
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

module.exports = Project;