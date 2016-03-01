module.exports = Query;

/**
 * Query
 *
 * this object is used to create a mongodb query in a fluent
 * style. The Query must always end with .get(...) or .not(...)
 *
 * @example```javascript
 *  new Query()
 *      .id([1,2,3])
 *      .fields({key: 'value', 'key': ['value','value','value'})
 *      .exists('author')
 *      .notExists('post')
 *      .sort('created', 'asc')
 *      .get('_id', 'author', 'post');
 *```
 * @constructor
 */
function Query(){
	this.query = {};
	this.special = {};
}

extend.fluent( Query.prototype, {
	/**
	 * search for documents based on ObjectId
	 *
	 * @param   {int|Array}   _id     id\s to search
	 *
	 * @returns {Query}               fluent by default
	 */
	id       : function( _id ){
		if( Array.isArray( _id ) ){
			extend( this.query, { _id: { '$in': _id } });
		} else {
			extend( this.query, { _id: _id });
		}
	},
	/**
	 * query using an object
	 *
	 * @param {Object}  obj     mongo db query object. arrays will be
	 *                          converted to $in queries
	 */
	fields: function( obj ){
		obj = Object.getOwnPropertyNames( obj ).reduce(function( ret, key ){
			if( Array.isArray( obj[ key ] )){
				ret[ key ] = {$in: {}};
				ret[ key ]['$in'] = obj[ key ];
				return ret;
			}
			ret[ key ] = obj[ key ];
			return ret;
		}, {});

		extend( this.query, obj );
	},
	/**
	 * find documents where a key exists
	 *
	 * @param   {string}  key     key to search
	 *
	 * @returns {Query}           fluent by default
	 */
	exists   : function( key ){
		var query = { '$exists': {} };
		query[ '$exists' ][ key ] = true;
		extend( this.query, query );
	},
	/**
	 * find documents where key does not exist
	 *
	 * @param   {string}  key     key no exclude
	 *
	 * @returns {Query}           fluent by default
	 */
	notExists: function( key ){
		var query = { '$exists': {} };
		query[ '$exists' ][ key ] = false;
		extend( this.query, query );
	},
	/**
	 * sort results
	 *
	 * @param   {string}    key     key to sort by
	 * @param   {string}    order   'asc' || 'desc'
	 *
	 * @returns {Query}             fluent by default
	 */
	sort     : function( key, order ){
		var sort = { '$orderby': {} };
		sort[ '$orderby' ][ key ] = order === 'asc' ? 1 : -1;
		extend( this.special, sort );
	},
	/**
	 * select only columns and get the resulting query object
	 *
	 * @returns {Array}    mongodb query object ready to be applied to mongodb.collection.find
	 */
	get      : function( /*colunms...*/ ){
		var columns = Array.prototype.slice.call( arguments, 0 )
			.reduce( function( obj, col ){
				obj[ col ] = 1;
				return obj;
			}, {});
		columns && extend( this.special, columns );
		return this._returnQuery();
	},
	/**
	 * select all other columns and get the resulting query object
	 *
	 * @returns {Array}    mongodb query object ready to be applied to mongodb.collection.find
	 */
	not      : function( /*colunms...*/ ){
		var columns = Array.prototype.slice.call( arguments )
			.reduce( function( obj, col ){
				obj[ col ] = 0;
				return obj;
			}, {});
		extend( this.special, columns );
		return this._returnQuery();
	},
	/**
	 * return the Query properties ready to be applied to mongodb.collection.find
	 *
	 * @returns {Array}     query, special parameters as array
	 */
	_returnQuery : function(){
		console.log( this.query, this.special );

		return this.special
			? [ this.query, this.special ]
			: this.query;
	}
});