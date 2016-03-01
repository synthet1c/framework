//module.exports = elegant;
//
//var
//	config      = require( './settings' ).mongo,
//	mongodb     = require( 'mongodb' ),
//	mongoServer = new mongodb.Server( config.host, config.port, {} ),
//	client      = new mongodb.Db( config.database, mongoServer, { w: 1 } );
//
//client.open( function( err ){
//	if( err ) throw err;
//	client.collection( 'test_insert', function( err, collection ){
//		if( err ) throw err;
//		collection.insert({
//				'title': 'I like cake',
//				'body' : 'It is quite good'
//			}, { safe: true },
//			function( err, documents ){
//				if( err ) throw err;
//				console.log( 'Document ID is: ' + documents[ 0 ].id );
//			});
//	});
//});
//
//function _id( id ){
//	return new client.bson_serializer.objectID( id );
//}
//
//function id( id ){
//
//	return isString( id )
//		? { _id: _id( id ) }
//		: isNumber( id )
//			? { id: id }
//			: id;
//}
//
//module.exports = Model;
//
//var models = {};
//
//function ModelRelationships(){}
//ModelRelationships.prototype = {
//
//	/**
//	 * links models with one to many relationship
//	 * @param model
//	 */
//	hasMany: function( model, primaryKey, foreignKey ){
//		this[ model.toLowerCase() ] = function(){
//			console.log( 'accessed ' + model );
//		}
//	},
//
//	/**
//	 * links models with a one to one relationship
//	 * @param model
//	 */
//	hasOne: function( model, primaryKey, foreignKey ){
//		this[ model.toLowerCase() ] = function(){
//			console.log( 'accessed ' + model );
//		}
//	},
//
//	/**
//	 * links models with many to many relationship
//	 * @param model
//	 */
//	belongsToMany: function( model, primaryKey, foreignKey ){
//		this[ model.toLowerCase() ] = function(){
//			console.log( 'accessed ' + model );
//		}
//	}
//};
//
///**
// * Model
// *
// * this has the instance methods of Models.
// *
// * @param name
// * @constructor
// */
//function Model( name ){
//	this.$name          = name;
//	this.$collection    = mongodb.collection( name );
//	this.$client        = client;
//	this.$mongo         = mongodb;
//
//	models[ name ] = this;
//};
//
///**
// * ModelRelationships
// *
// * This object stores the prototype of Model. It has the relationship methods
// *
// * @type {ModelRelationships}
// */
//Model.prototype = new ModelRelationships();
//extend( Model.prototype, {
//	update: function( id, props ){
//		this._collection.update( id, props );
//	},
//	save  : function(){
//
//		var props = onlyProperties( this );
//
//		mongodb
//			.collection( this._name )
//			.update( this._id(), props );
//	}
//});
//
///**
// * static methods for Objects that inherit model.
// *
// * methods are access by calling the constructor
// * @type {{find: Function, where: Function, create: Function, get: Function, all: Function}}
// */
//var staticModel = {
//
//	/**
//	 * Model::find
//	 *
//	 * find user information via id or serialized id
//	 *
//	 * @param id    mixed   id or bson serialized id
//	 */
//	find  : function( id ){
//		return new this( users[ id ] );
//	},
//
//	/**
//	 * Model::where
//	 *
//	 * @param   string  prop    property name
//	 * @param   string  val     prperty value
//	 *
//	 * @returns Model || [Model]
//	 */
//	where : function( prop, val ){
//
//		var self = this,
//		    filtered;
//
//	    filtered = users.filter( function( item ){
//
//		    return item[ prop ] === val;
//
//	    }).map( function( user ){
//
//		    return new self( user );
//	    });
//
//		return filtered.length === 1
//			? filtered[ 0 ]
//			: filtered;
//	},
//
//	/**
//	 * Model::create
//	 *
//	 * returns a new instance of the model
//	 *
//	 * @param Model
//	 */
//	create: function( props ){
//
//		return new this( props );
//	},
//	get : function(){
//
//	},
//	all : function(){
//
//	}
//};
//
//
//function elegant( instance, extra ){
//
//	var name = instance.name;
//
//	instance.prototype      = new Model( name );
//	instance.constructor    = instance;
//
//	var shared = {
//		model       : name,
//		collection  : mongodb.collection( name + 's' ),
//		template    : getSet( 'template', TEMPLATE_DIR + '/' + name + 's' )
//	};
//
//	extend( instance, staticModel, shared, extra || {} );
//	extend( instance.prototype, shared );
//
//	return instance;
//}