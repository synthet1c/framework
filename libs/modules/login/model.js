var
	elegant = require( LIB_DIR + 'model' ),
	Template = require( LIB_DIR + 'Template' );

/**
 * Login model inherits all of the generic model functionality
 * through elegant.
 */
var Login = elegant(
	/**
	 * @constructor
	 *
	 * @param {Object}    props    properties to inherit
	 */
	function Login( props ){
		extend( this, props || {} );
	},
	/**
	 * @static methods
	 *
	 * static methods for the mongo Model.
	 *
	 * **static methods are fluent by default**.
	 */
	{
		something: function( thing ){
			console.log( thing );
		}
	},
	/**
	 * @prototype methods
	 *
	 * Object instances will inherit these methods when they are
	 * pulled from mongo and created with their model.
	 *
	 * **prototype methods are fluent by default**
	 */
	{
		// nothing to see here
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

module.exports = Login;