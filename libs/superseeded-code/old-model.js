var
	config      = require( './settings' ),
	mongodb     = require( 'mongodb' ),
	ObjectID    = mongodb.ObjectID,
	mongoServer = new mongodb.Server( config('mongo.host'), config('mongo.port'), {}),
	client      = new mongodb.Db( config('mongo.database'), mongoServer, { w: 1 }),

    relations   = require('./relationship-model'),

	ModelRelationships  = relations.ModelRelationships,
    RelationshipModel   = relations.RelationshipModel;


module.exports = elegant;

var
    models = {};

/**
 * Model
 *
 * this has the instance methods of Models.
 *
 * @param name
 * @constructor
 */
function Model( name ){
	this.$client = client;
	this.$mongo = mongodb;

	models[ name ] = this;
};

/**
 * ModelRelationships
 *
 * This object stores the prototype of Model. It has the relationship methods
 *
 * @type {ModelRelationships}
 */
Model.prototype = new ModelRelationships();
extend( Model.prototype, {
	update: function( id, props ){
		this.$collection.update( id, props );
	},
	save  : function( success ){

		var props = ownProperties( this );

		this.$collection(function( db ){
			db.insert( props, function( err, record ){
				if( err ) throw err;
				success( record.ops[0] );
				client.close();
			});
		});
		//mongodb
		//	.collection( this.$model )
		//	.update( this.$id(), props );
	}
});


var privateMethods = {
	find: function( $client, __STATIC__, query ){

		$client( function( db ){

			db.find( query, handleErr( function( results ){

				results.toArray(function( resultsArr ){
					var res = resultsArr.map( function( item ){
						return new __STATIC__( item );
					});

					if( res.length === 1 ) res = res[0];

					cb.call( res, res );
					client.close();
				});

			}));

		})
	}
};


var staticModel = {
	/**
	 * @static find
	 *
	 * this static method will find a documents based on id.
	 * if an array is passed multiple documents can be returned
	 *
	 * @param  {Mixed}    id        int:id of document array:ids of documents
	 * @param  {Function} cb        callback function to recieve documents
	 *
	 * @return {mixed}            result of callback
	 */
	find  : function( id, cb ){

		return privateMethods.find
			.call( this.$collection, this.$collection, this, _id( id ), cb );
	},
	/**
	 * @static where
	 * @param  {Object}     query   [description]
	 * @param  {Function}   cb      [description]
	 * @return {Array}              [description]
	 */
	where : function( query, cb ){

		var __STATIC__ = this;

		this.$collection(function( db ){

			var args = [ query ];

			db.find.apply( db, !cb ? args : args.concat( [ __STATIC__.$getErrorHandler( _find ) ] ));

			function _find( results ){

				results.toArray( function( err, arr ){

					var res = arr.map( function( item ){
						return new __STATIC__( item );
					});
					if( res.length === 1 ) res = res[ 0 ];

					client.close();
					return cb.call( res, res );
				});
			}

		});
	},
	first: function( query, cb ){
		return this.where( query, function( results ){
			if( Array.isArray( results )){
				return cb.call( results[ 0 ], results[ 0 ] );
			}
			return cb.call( results, results );
		});
	},
	create: function( props ){

		return new this( props );
	},
	insert: function( pimary, props, cb ){

		var __STATIC__ = this;

		this.$client.connect( handle( function( db ){

			var args = [ primary, props ];

			db.insert.apply( db, !cb ? args : args.concat( [ { w: 1 }, __STATIC__.setError( _insert ) ] ) );

			function _insert( results ){

				var res = results.map( function( item ){
					return new __STATIC__( item );
				});

				cb.call( res, res );
			}

		}));
	},
	destroy: function( query, fn ){
		this.$collection(function( db ){
			db.remove( _id( query ), function( err, result ){
				if( err ) throw err;
				fn && fn.call( this, result ) || console.log( result );
				client.close();
			});
		});
	},
	get: function(/*columns...*/){
		var columns = Array.prototype.slice.call( arguments );

	}
};


function elegant( constructor, staticMethods, prototypeMethods, errorHandlers ){

	var
		name = constructor.name,
		pluralName = name + 's',
		errorHandler = errorDelegate( errorHandlers ); 		// partially apply error handlers

	constructor.prototype = new Model( name );
	constructor.constructor = constructor;

	/**
	 * shared
	 *
	 * this objects houses the functions that are shared between the static
	 * and instance versions of a model
	 *
	 * @type {Object}
	 */
	var shared = {
		$model          : name,
		$collection     : collection( pluralName.toLowerCase(), constructor ),
		$getErrorHandler: handleError( errorHandler( 'get' ) ),
		$setErrorHandler: handleError( errorHandler( 'set' ) )
	}

	// mixin static methods
	extend.fluent( constructor, staticModel, shared, staticMethods || {});

	// mixin prototype methods
	extend.fluent( constructor.prototype, shared, prototypeMethods || {});

	return constructor;
}

extend( elegant, {

	/**
	 * links models with one to many relationship
	 *
	 * @param    {boolean}    bind    bind to this obj
	 *
	 * @returns ModelRelationship.hasMany
	 */
	hasMany: RelationshipModel.hasMany( false ),

	/**
	 * links models with one to one relationship
	 *
	 * @param    {boolean}    bind    bind to this obj
	 *
	 * @returns ModelRelationship.hasOne
	 */
	hasOne: RelationshipModel.hasOne( false ),

	/**
	 * links models with many to many relationship
	 *
	 * @param    {boolean}    bind    bind to this obj
	 *
	 * @returns ModelRelationship.belongsToMany
	 */
	belongsToMany: RelationshipModel.belongsToMany( false )

});


/**
 * Helper Functions
 */

var handle = handleError(genericError);

/**
 * this function will create a connection to mongodb and
 * return a function to execute a query on the database
 *
 * @param   {string}    name    name of the collection
 * @param   {Model}     STATIC  static Model constructor
 *
 * @returns {Function}  connection to mongodb client
 */
function collection( name, STATIC ){
	return function( callback ){
		client.open( function( err ){
			if( err ) throw err;
			client.collection( name, handle(callback) );
		});
	}
}

/**
 *
 * @param id
 * @returns {ObjectID}
 */
function serializedID( id ){
	return new ObjectID( id );
}

/**
 * this function will return a searchable object to use
 * with mongo db, returning one or many Mongo::ObjectID's
 *
 * @param   {mixed}     id      id or array of id's
 *
 * @returns {mongodb.bson_serializer.objectID}
 * @private
 */
global._id = _id;
function _id( id ){

	return isArray( id )
		? { _id: {'$in': id.map( serializedID ) }}
		: isString( id )
			? { _id: serializedID( id ) }
			: isNumber( id )
				? { id: id }
				: id;
}

/**
 * handleError
 *
 * this function will handle errors in the application receiving
 * the correct error from the errorHandlers object or genericError.
 *
 * @param  {Function}    handler    error handler that returns an Error
 *
 * @return {Function}   partially applied function that takes in the callback
 *
 *      @param      {Function}  fn    callback function
 *      @returns    {mixed}           result of callback
 *      @throws     {Error}           error if nodejs error
 *
 */
function handleError( handler ){
	return function( fn ){
		return function( err, res ){				// standard node callback with error and result
			if( err ){
				throw handler.call( this, err );
			}
			return fn.call( this, res );
		}
	}
}

/**
 * errorDelegate
 *
 * this partial application will recieve an error handlers
 * object and return a function which takes in the type of
 * error to delegate
 *
 * @param {Object}    errorHandlers    {get: Function set: Function}
 *
 * @returns {Function}   errorDelegateType
 *
 *         @param    {string}    type    typeof error to apply on error
 */
function errorDelegate( errorHandlers ){
	return function errorDelegateType( type ){
		if( !type || !errorHandlers ){
			return genericError;
		}

		return isObject( errorHandlers )
			? errorHandlers[ type ]
			: errorHandlers;
	}
}

/**
 * genericError
 *
 * this function will be applied if no error handlers are
 * present. the Error must be returned as it gets thrown later
 *
 * @param  {Error}    err    nodejs Error object
 *
 * @return {Error}            user generated error
 */
function genericError( err ){
	return new Error( 'mongo database error', err );
}