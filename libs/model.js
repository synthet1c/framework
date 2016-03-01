var
	config      = require( './settings' ),
	mongodb     = require( 'mongodb' ),
	ObjectID    = mongodb.ObjectID,
	connection  = require( LIB_DIR + 'connection' ),
	relations   = require('./relationship-model'),
	Thread      = require( 'webworker-threads' ),
	Worker      = Thread.Worker,

	ModelRelationships  = relations.ModelRelationships,
	RelationshipModel   = relations.RelationshipModel;


module.exports = elegant;


// simplex
// adjure
// fluid

/**
 * Model
 *
 * this has the instance methods of Models.
 *
 * @param name
 * @constructor
 */
function Model(){
	this.query          = {};
	this.projections    = {};
	this.updates        = { $set: {} };
	this.options        = {};
	this.filter         = {};
	this.joins          = {};
	this.events         = {};
	this.queryUpdate    = false;           // set true when an update is required
	this.queryBuilt     = false;
	this.noReturn       = false;           // set to true when the exec method is used
	this.returnAs       = null;            // choose the return type. default:cursor
	this.stack          = [];
	this.resolved       = [];
	this.hasJoins       = false;
	this.results        = null;
	this.attachments    = {};
}

function reindexByJoin( results, on, _with ){

	return results.reduce(function( ret, result ){
		ret[ result[ on ].toString() ] = result;
		return ret;
	}, {});
}

Model.prototype = new ModelRelationships();
extend( Model.prototype, {
	update: function( id, props ){
		this.$collection.update( id, props );
	},
	/**
	 * Model.save
	 *
	 * save a model instance to the database.
	 *
	 * @param   {Function}  success     callback function if insert was successful
	 *                                  recieves argument of inserted record
	 */
	save  : function( success ){

		var props = ownProperties( this );

		this.$collection( function( db ){
			db.insert( props, function( err, record ){
				if( err ) throw err;
				success( record.ops[ 0 ] );
			});
		});
	},
	_find: function( callback ){

		var self = this;

		this.$collection( function( collection ){

			collection.find( self.query, self.projections, self.filter, function( err, cursor ){

				if( err ) throw err;

				return self._returnAs( cursor, callback );
			});
		});
	},
	/**
	 * @private Model._returnAs
	 *
	 * this method will determine the type of response the controller has
	 * requested, and return the correct type.
	 *
	 * @param   {Cursor}    cursor      MongoDB cursor object
	 * @param   {Function}  callback    callback to received the result
	 *
	 * @returns {*}                     Object | Array | instance | cursor
	 */
	_returnAs: function( cursor, callback ){

		var self = this;

		if( !self.returnAs ) return callback.call( self, cursor );
		if( self.returnAs === 'toStream' ) return callback.call( self, cursor.stream );

		return cursor[ self.returnAs === 'toObject' || self.returnAs === 'toInstance'
			? 'toArray'
			: self.returnAs ]( function( err, results ){

			if( Object.keys( self.attachments ).length ){
				results = results.map( function( result ){
					extend( result, self.attachments );
					return result;
				} );
			}

			return err
				? self.error( err )
				: callback.call( self, self.returnAs === 'toObject'
					? results[ 0 ]
						: self.returnAs === 'toInstance'
						? self.$instance( results )
						: results );
		} );

	},
	/**
	 * @private Modal._update
	 *
	 * this method will update a record in the mongo database. if a callback is passed
	 * another query will be made to retrieve the updated record, else no checking will be
	 * done to ensure write success.
	 *
	 * @param   {Function}  callback    optional: callback to process result ofter update
	 */
	_update: function( callback ){
		var self = this;

		this.$collection(function( collection ){

			collection.update( self.query, self.updates, self.options, function( err, result ){

				if( err ) throw err;
				if( !result.result.n || self.noReturn ) return callback.call( self, result.result );

				collection.find( self.query, self.projections, self.filter, function( err, cursor ){

					if( err ) throw err;
					if( self.returnAs === 'toCursor' ) return callback.call( self, cursor );
					if( self.returnAs === 'toStream' ) return callback.call( self, cursor.stream );

					return cursor[ self.returnAs === 'toObject' ? 'toArray' : self.returnAs ]( function( err, results ){
						return err
							? self.error( err )
							: callback.call( self, results.length === 1 && self.returnAs === 'toObject' ? results[ 0 ] : results );
					});

				});

			});
		});
	},
	/**
	 * @private Model.join
	 *
	 * this method will join multiple db queries into their correct relationships
	 *
	 * @param   {Function}  callback    callback function to handle the result of the join
	 */
	_join: function( callback ){

		var totalJoins = Object.keys(this.joins).length,
		    self = this,
		    key;

		self.returnAs = 'toArray';

		self._find( function( results ){

			self.results = results;

			for( key in self.joins ) {
				(function( key, join ){

					join = {
						model  : models[ key ],
						name   : join[ 3 ] || models[ key ].name.toLowerCase(),
						by     : join[ 0 ],
						on     : join[ 1 ],
						'with' : join[ 2 ],
						results: {}
					};

					var query = {};

					if( Array.isArray( results )){
						query[ join.with ] = {
							$in: results.map(function( result ){
								return join.with === '_id'
									? new ObjectID( result[ join.on ] )
									: result[ join.on ]
							})
						};
					} else {
						query[ join.with ] = (join.with === '_id')
							? ObjectID( results[ join.on ] )
							: results[ join.on ];
					}


					join.model
						.where( query )
						// TESTING: was toArray but that does not allow further chaining
						.toArray( function( results ){
							join.results = results;
							self.resolved.push( join );

							if( self.resolved.length === totalJoins ){
								self._resolve( callback );
							}
						});

				})( key, self.joins[ key ] );
			}

		});
	},
	/**
	 * @private Model._resolve
	 *
	 * this method is called when all requsets for the relationships have been
	 * successful. it's job is to delegate the sorting to a worker thread and
	 * await the response. Once all responses have been received it will return
	 * the final formatted result.
	 *
	 * @param   {Function}  callback    callback to reveive the final formatted result
	 */
	_resolve: function( callback ){

		var
			results  = this.results,
			resolved = this.resolved;

		// web worker to handle the loop
		var worker       = new Worker(function(){
			self.onmessage = function( event ){
				var data = JSON.parse( event.data ),
					results = data.results,
					resolved = data.resolved;

				resolved.forEach(function( resolve ){

					switch( resolve.by ){
						case 'hasMany':
							delete results[ resolve.on ];
							results[ ( resolve.name + 's' ) ] = resolve.results;
							break;
						case 'hasOne':

							resolve.reindexed = resolve.results.reduce( function( obj, result ){
								obj[ result[ resolve.with ] ] = result;
								return obj;
							}, {} );

							// results = {results: results, resolve: resolve};

							if( Array.isArray( results )){
								results = results.map( function( result ){
									result[ resolve.on ] = resolve.reindexed[ result[ resolve.on ] ];
									return result;
								} );
							} else {
								results[ resolve.name ] = resolve.reindexed[ results[ resolve.on ] ];
							}
							break;
						case 'belongsTo':
							results = results.map(function( result ){

								if( Array.isArray( resolve.results ) ){
									result[ resolve.on ] = resolve.results.reduce( function( ret, item ){
										var onId   = result[ resolve.on ],
										    withId = item[ resolve.with ];

										if( onId === withId ){
											return item;
										}
										return ret;
									}, {} );
								} else {
									result[ resolve.on ] = resolve.results;
								}
								return result;
							});
							break;
					}
				});

				postMessage( results );
				self.close();

				function reindex( results, on ){
					return results.reduce( function( obj, result ){
						obj[ result.on ] = result;
						return obj;
					}, {} );
				}
			};

		});

		// callback wh'en worker is finished
		worker.onmessage = function( result ){
			return callback.call( this, result.data );
		};

		// post data to the worker
		worker.postMessage(JSON.stringify({
			results: results,
			resolved: resolved
		}));

	},
	build: function( callback ){

		var
			self = this;

		if( this.hasJoins ){

			this._join( callback );

		} else {

			return self.queryUpdate
				? this._update( callback )
				: this._find( callback );

		}
	}
});

/**
 * @static Model
 *
 * all static Model functions are fluent by default returning the
 * static Model object if a value is not returned to enable easy
 * chaining of static methods
 *
 * All static methods modify a mongodb query, the request is only fired
 * when toObject | toArray | toCursor | toInstance are called.
 */
extend.fluent( Model, {

	/**
	 * @static Model::find
	 *
	 * this method will find a record from a collection by id.
	 * if passing an array of id's multiple records can be retrieved
	 *
	 * @param {int|Array}   id  id\s to get from the models collection
	 *
	 * @returns {Model}     static model for chaining
	 */
	find   : function( id ){

		if( Array.isArray( id ) ){
			id = { '$in': id };
		}

		extend( this.query, { _id: id } );

	},
	/**
	 * @static Model::update
	 *
	 * this function will allow updating a record after it is
	 * found by id.
	 *
	 * @param   {Object}    obj     values to update the record with
	 */
	update: function( obj ){

		this.queryUpdate = true;

		addProperty( this.updates, '$set', obj );

	},
	/**
	 * @static Model.all
	 *
	 * this method will return all records from mongo
	 */
	all: function(){
		this.query = {};
		this.options['multi'] = true;
	},
	/**
	 * @static Model::where
	 *
	 * this method will allow the developer to narrow the search results
	 *
	 * @param query
	 */
	where  : function( query ){

		for( var key in query ){
			var val = query[key];
			if( key === '_id'){
				if( val.$in ){
					val = val.$in.map(function( id ){
						return new ObjectID( id );
					});
				} else {
					val = new ObjectID( val );
				}
			}
				addProperty( this.query, key, val );
		}
	},
	/**
	 *
	 * @param bool
	 */
	multi: function( bool ){
		this.options['multi'] = bool || true;
	},
	exists : function( key ){

		addProperty( this.query, key, { $exists: true } );
	},
	missing: function( key ){

		addProperty( this.query, key, { $exists: false } );
	},
	between: function( key, lt, gt ){

		addProperty( this.query, key, {
			$lt: lt,
			$gt: gt
		});
	},
	larger: function( key, value ){

		addProperty( this.query, key, {
			$gt: value
		});

	},
	smaller: function( key, value ){

		addProperty( this.query, key, {
			$lt: value
		});

	},
	limit  : function( size ){

		extend( this.filter, { 'limit': size } );

	},
	skip   : function( size ){

		extend( this.filter, { 'size': size } );

	},
	get    : function( /*columns...*/ ){

		var columns = Array.prototype.slice.call( arguments );

		columns = columns.reduce( function( obj, key ){
			obj[ key ] = 1;
			return obj;
		}, {});

		extend( this.projections, columns );

	},
	not    : function( /*columns...*/ ){

		var columns = Array.prototype.slice.call( arguments );

		columns = columns.reduce( function( obj, key ){
			obj[ key ] = 0;
			return obj;
		}, {});

		extend( this.projections, columns );

	},
	attach: function( obj ){
		extend( this.attachments, obj );
	},
	success: function( callback ){

		// get underpants
		this.build( function( results ){

			callback.call( this, results );
		});

	},
	/**
	 * @static Model::toArray
	 *
	 * get the formatted database query as an array. this is automatically
	 * called when requesting some joins. many to many
	 *
	 * @param   {Function}  callback    callback to handle result
	 */
	toArray: function( callback ){

		this.returnAs = 'toArray';

		this.build(function( results ){

			if( this.resolved && this.resolved.length ){
				return callback.call( this, results );
			}

			if( this.hasJoins ){

				for( var key in this.joins ){
					var join = this.joins[ key ];

					this.stack.push({
						name    : key,
						model   : models[ key ],
						modelName: models[ key ].toLowerCase(),
						resolved: false,
						results : null,
						complete: callback,
						context : this
					});
				}

			} else {
				callback.call( this, results );
			}
		});
	},
	/**
	 * @static Model::toObject
	 *
	 * get the final database result as a native javascript
	 * object. This is only used for single results
	 */
	toObject: function(){
		this.toArray.apply( this, arguments );
		this.returnAs = 'toObject';
	},
	/**
	 * @static Model::toCursor
	 *
	 * get the mongodb cursor iterator
	 *
	 * @param  {Function}   callback    callback to receive the cursor
	 */
	toCursor: function( callback ){

		this.build( function( results ){

			callback.call( this, results );
		});
	},
	/**
	 * @static Model::toStream
	 *
	 * Receive the response as a stream. Joins are not possible with this
	 * method
	 *
	 * @param   {Function}  callback    callback to revieve the stream
	 */
	toStream: function( callback ){

		this.returnAs = 'toStream';

		this.build( function( results ){

			callback.call( this, results );
		});

	},
	/**
	 * @static Model::toInstance
	 *
	 * instantiate a new object from the model for each record returned
	 * by mongodb
	 *
	 * @param   {Function}  callback    function to revieve the result
	 */
	toInstance: function( callback ){

		this.toArray.apply( this, arguments );
		this.returnAs = 'toInstance';
	},
	/**
	 * @static Model::exec
	 *
	 * TODO: remove the callback
	 *
	 * run the query on the mongo database but don't return any
	 * result.
	 *
	 * @param {Function}   callback
	 */
	exec: function( callback ){

		this.noReturn = true;

		// get underpants
		this.build( function( results ){

			callback && callback.call( this, results );
		});

	},
	joinStack: function( obj ){
		this.stack.push( obj );
	},
	/**
	 * @static Model::destroy
	 *
	 * remove the matched record from the collection
	 *
	 * @param   {int|String}    id to match
	 * @param   {Function}      callback to receive confirmation object
	 */
	destroy: function( id, callback ){
		this.$collection(function( collection ){
			collection.remove( _id(id), function( err, res ){
				if( err ) throw err;

				callback.call( this, res );
			});
		});
	}

});

/**
 * send
 *
 * TODO: delete, doesn't work
 *
 * helper function to call a method on an object
 *
 * @param cursor
 * @param callback
 * @param arg
 * @returns {*}
 */
function send( cursor, callback, arg ){
	return cursor[callback]( arg );
}

var models = {};

/**
 * elegant
 *
 * generate a new model. elegant will instantiate a model with the desired name
 * and handle the prototype inheritance as well as attaching the static methods
 * to give a solid fluent interface
 *
 * @param   {Function}  constructor     Constructor function for the class
 * @param   {Function}  instance        instance function to extend
 * @param   {Object}    methods         shared methods the static and prototype will inherit
 * @param   {Object}    errorHandlers   default error handlers for the model
 *
 * @returns {Model}
 */
function elegant( constructor, instance, methods, errorHandlers ){

	var
		name = constructor.name,
		pluralName = name + 's',
		errorHandler = errorDelegate( errorHandlers ); 		// partially apply error handlers

	constructor.prototype = new Model( name );
	constructor.prototype.constructor = Model;

	constructor.constructor = constructor;

	/**
	 * shared
	 *
	 * this objects houses the functions that are shared between the static
	 * and instance versions of a model
	 *
	 * @type {Object}
	 */
	var _shared = {

		create: function(props){
			var obj = new instance( props );
			extend( obj, props );
			return obj;
		},
		destroy: boot( Model.destroy ),

		/** queries */
		find   : boot( Model.find ),
		where  : boot( Model.where ),
		all    : boot( Model.all ),
		multi  : boot( Model.multi ),
		exists : boot( Model.exists ),
		missing: boot( Model.missing ),
		larger : boot( Model.larger ),
		smaller: boot( Model.smaller ),
		between: boot( Model.between ),

		/** update */
		update:  boot( Model.update ),

		/** projections */
		get: boot( Model.get ),
		not: boot( Model.not ),

		/** filters */
		limit: boot( Model.limit ),
		size : boot( Model.size ),
		skip : boot( Model.skip ),

		attach: boot( Model.attach ),

		/** events */
		success : bootError( Model.success ),
		exec    : bootError( Model.exec ),
		toArray : bootError( Model.toArray ),
		toStream: bootError( Model.toStream ),
		toCursor: bootError( Model.toCursor ),
		toObject: bootError( Model.toObject ),
		toInstance: bootError( Model.toInstance ),

		/** utilities */
		$model          : name,
		$getErrorHandler: handleError( errorHandler( 'get' ) ),
		$setErrorHandler: handleError( errorHandler( 'set' ) ),
		$instance: function( results ){
			var _instance,
			    ret;

			if( Array.isArray( results ) ){

				if( results.length > 1 ){
					ret = results.map( function( item ){
						_instance = new instance();
						extend( _instance, results );
						return _instance;
					})

				} else {
					ret = new instance();
					extend( ret, results[0] );
				}

			} else {
				ret = new instance();
				extend( ret, results );
			}

			return ret;
		}

		/** mongodb connections */
	};

	extend( constructor, _shared, methods || {} );
	extend( constructor.prototype, _shared, methods, {
		$collection: function( callback ){
			connection(function( db ){
				var collection = db.collection( pluralName.toLowerCase() );
				return callback.call(this, collection );
			});
		}
	});

	extend.fluent( instance.prototype, {
		save: function( success ){

			var self = this;

			connection(function(db){
				var col = db.collection( lc(pluralName) );
				col.insert( self, function( err, record ){
					if( err ) throw err;
					success.call( this, record.ops[ 0 ] );
				});
			});
		}
	});

	models[ name ] = constructor;

	return constructor;

	/**
	 * elegant Helpers
	 */

	function boot( cb ){
		return function( query ){

			var self = this,
			    args = arguments.length > 1
					? Array.prototype.slice.call( arguments, 0 )
				    : [ query ];

			if( self instanceof constructor === false ){
				self = new constructor();
			}
			return cb.apply( self, args );
		}
	}

	function bootError( cb ){
		return function _bootError( callback ){

			if( this instanceof constructor === false ){
				throw new Error( 'constructor must be an instance of Model' );
			}

			cb.call( this, callback );

		}
	}

}

/**
 * Relationships are event based and will only notify the model
 * that there is a relationship available. If the user calls the
 * relationship, the model will retrieve the appropriate data from
 * mongo and format it to the relationship structure
 *
 *
 * var Model = elegant(
 * function Model( props ){
 *		this.__proto__.constructor.call( this );
 *	},
 * function model(){},
 * {
 *	 // methods to inherit into model
 * },
 * {
 *	 // error functions
 }
 );
 */
extend( elegant, {

	/**
	 * @static  Elegant::hasMany
	 *
	 * notify elegant of a one to many relationship between records
	 *
	 * @param   {String}    model       model name (many)
	 * @param   {String}    foreign     foreign key to join (many)
	 * @param   {String}    primary     primary key to join with (one)
	 *
	 * @returns {Function}
	 */
	hasMany: function( model, foreign, primary ){

		var join = Array.prototype.slice.call( arguments, 1 );
		join.unshift( 'hasMany' );

		return function(){

			this.joins[ model ] = join;
			this.hasJoins = true;

			return this;
		}
	},
	/**
	 * @static Elegant::hasOne
	 *
	 * notify elegant of a one to one relationship
	 *
	 * @param   {String}    model       model name to join
	 * @param   {String}    foreign     foreign key on joined model
	 * @param   {String}    primary     primary key on parent record
	 *
	 * @returns {Function}              curried function
	 */
	hasOne: function( model, foreign, primary ){

		var join = Array.prototype.slice.call( arguments, 1 );
		join.unshift( 'hasOne' );

		return function(){

			this.joins[ model ] = join;
			this.hasJoins       = true;

			return this;
		}
	},
	/**
	 * @static Elegant.belongsTo
	 *
	 * notify elegant of a one to many relationship from the child
	 *
	 * @param   {String}    model       parent model name
	 * @param   {String}    foreign     parent model primary key
	 * @param   {String}    primary     child model foreign key
	 *
	 * @returns {Function}              curried function
	 */
	belongsTo: function( model, foreign, primary ){

		var join = Array.prototype.slice.call( arguments, 1 );
		join.unshift( 'belongsTo' );

		return function(){

			this.joins[ model ] = join;
			this.hasJoins       = true;

			return this;
		}
	},
	/**
	 * @static Elegant::belongsToMany
	 *
	 * notify elegant of a many to many relationship
	 *
	 * @param   {String}    model       name of the model to join
	 * @param   {String}    foreign     name of the joined foreign key
	 * @param   {String}    primary     name of the parents primary key
	 * @returns {Function}
	 */
	belongsToMany: function( model, foreign, primary ){
		return function(){

		};
	}

} );


//User
//	.larger('age', 31)
//	.not('password')
//	.success(function( res ){
//
//		console.log( res );
//
//	});


//User
//	.all()
//	.update({
//		password: 'p@55w0rd!'
//	})
//	.success(function( res ){
//
//		console.log( res );
//	});

//User
//	.where({first: 'andrew'})
//	.update({last: 'founts'})
//	.get()
//	.posts()
//	.success(function( results ){
//		console.log( results );
//	});

//User
//	.where({last: 'fountain'})
//	.success(function( result ){
//		console.log( result );
//	});
//
//User
//	.where({last: ['fountain', 'henderson', 'white']})
//	.posts()
//	.toArray(function( arr ){
//		console.log( arr );
//	});

//User
//	.where({first: 'andrew'})
//	.posts()
//	.toArray(function( posts ){
//		console.log( posts );
//	});

//User
//	.where({last: 'fountain'})
//	.toStream(function( cursor ){
//		console.log( cursor );
//	});

// .where( { name: 'alisha' } )
//.missing( 'username' )
//.between( 'age', 20, 30 )
//.limit( 10 )
//.skip( 5 )
// .not( 'password' )
// .posts()


// Post
// 	.from(-30)
// 	.join('user', 'author', '_id', {not: ['password']})
// 	.limit(20)
// 	.success(function( posts ){

// 		console.log( posts );

// 	});

/**
 * Helper Functions
 */

var handle = handleError(genericError);

/**
 * collection (curried)
 *
 * this function will create a connection to mongodb and
 * return a function to execute a query on the database
 *
 * @param   {string}    name    name of the collection
 * @param   {Model}     STATIC  static Model constructor
 *
 * @returns {Function}  connection to mongodb client
 */
function collection( name, STATIC ){
	/**
	 * @param   {Function}  callback to receive the mongodb cursor
	 */
	return function( callback ){
		connection( function( db ){
			db.collection( name, handle(callback) );
		});
	}
}

/**
 * this function will add a new property to the query object
 *
 * TODO: there has to be a better way than a million if statements
 *
 * @param   {Model}     self    reference to the model instance
 * @param   {String}    key     key to add
 * @param   {*}         value   value to set to the key
 *
 * @returns void
 */
function addProperty( self, key, value ){

	var origValue = self[ key ],
	    valueIsArray = Array.isArray( value );

	if( origValue ){                                                 // key already exists

		if( origValue.$in ){                                         // key is an array of values

			if( valueIsArray ){                                      // value is an array
				origValue.$in = origValue.$in.concat( value );       // add value array to existing array
			} else {                                                 // value is not an array
				origValue.$in.push( value );                         // push value to existing array
			}

		} else {                                                     // key doesn't already exist

			if( valueIsArray ){                                      // value is an array
				origValue = { $in: [ origValue ].concat( value ) };  // make it an $in clause and concat the value array
			} else {                                                 // value is not an array
				origValue = { $in: [ origValue, value ] };           // create new array with both values
			}
		}

	} else {                                                         // key is not set

		if( valueIsArray ){                                          // value is an array
			origValue = { $in: value };                              // make it an $in clause and concat the value array
		} else {                                                     // value is not an array
			origValue = value;                                       // create new array with both values
		}                                           // set value to key

	}

	self[ key ] = origValue;

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
 * @param   {int|Array}     id      id or array of id's
 *
 * @returns {ObjectID}
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
 * @return {Function}   partially applied function that takes in the callback*
 */
function handleError( handler ){
	/**
	 * @param      {Function}  fn   callback function
	 * @returns    {Function}       function to receive callback
	 */
	return function( fn ){
		/**
		 * @param {Error}       node js error object
		 * @param {*}           response from query
		 *
		 * @returns     {Function}      function to recieve node response
		 *
		 * @throws     {Error}          error if nodejs error
		 */
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
 */
function errorDelegate( errorHandlers ){
	/**
	 * @param    {string}    type    typeof error to apply on error
	 */
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