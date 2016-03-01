var
	elegant     = require( LIB_DIR + 'model'),
    Template    = require( LIB_DIR + 'Template');

/**
 * Post model inherits all of the generic model functionality
 * through elegant.
 */
var Post = elegant(
	/**
	 * @constructor
	 *
	 * @param {Object}    props    properties to inherit
	 */
	function Post(){
		this.__proto__.constructor.call( this );
	},
	/**
	 * @instance
	 */
	function post( props ){},
	/**
	 * @prototype methods
	 *
	 * Object instances will inherit these methods when they are
	 * pulled from mongo and created with their model.
	 *
	 * **prototype methods are fluent by default**
	 */
	{
		author : elegant.belongsTo( 'User', 'author', '_id' )
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

module.exports = Post;