// native objects and types
global.isObject     = isType('object');
global.isNumber     = isInstance( Number );
global.isString     = isType('string');
global.isArray      = isInstance( Array );
global.isFunction   = isType('function');

// callback errors
global.handle       = handle;
global.handleError  = handle;

// arguments
global.butFirst     = butFirst;
global.slice        = slice;
global.inject       = inject;

// Objects
global.extend       = extend;
global.ownProperties= ownProperties;

// Strings
global.lc           = lc;
global.uc           = uc;
global.single       = single;
global.plural       = plural;

global.unique       = unique;
global.join         = join;

var __slice = Array.prototype.slice;

global.__slice      = __slice;

function slice( array, start ){
	return __slice.call( array, start || 0 );
}

function isType( type, thing ){

	return thing
		? _isType( thing )
		: _isType;

	function _isType( thing ){
		return typeof(thing) === type;
	}
}

function isInstance( instance, thing ){

	return thing
		? _isInstance( thing )
		: _isInstance;

	function _isInstance( thing ){
		return thing instanceof instance;
	}
}

function handleErr( errFn ){
	return function( fn ){
		return handle.call( this, fn, errFn );
	}
}

function butFirst( arguments ){
	return __slice.call( arguments, 1 );
}

function lc( str ){
	return str.toLowerCase();
}

function uc( str ){
	return str.toUpperCase();
}

function plural( str ){
	if( str.lastIndexOf('s') !== str.length -1 ){
		str = str + 's';
	}
	return str;
}

function single( str ){
	if( str.lastIndexOf('s') === str.length - 1 ){
		str = str.substring( str.length - 1 );
	}
	return str;
}

function handle( fn, msg ){
	return function( err, res ){
		return err
			? isFunction( msg )
				? msg.apply( this )
				: new Error( ( msg || 'There was an error: ') + err )
			: fn.apply( this, butFirst( arguments ) );
	}
}

function ownProperties( self ){
	var props = {};
	for( var key in self ) {
		if( self.hasOwnProperty( key ) && typeof self[ key ] !== 'function' ){
			props[ key ] = self[ key ];
		}
	}
	return props;
}

function extend( reciever /* ,givers... */ ){
	var givers = Array.prototype.slice.call( arguments, 1 );

	givers.forEach( function( giver ){

		Object.getOwnPropertyNames( giver )
			.forEach( function( key ){
				reciever[ key ] = giver[ key ];
			});

	});

	return reciever;
}

extend( extend, {
	fluent: function fluentExtend( reciever /* ,givers... */ ){
		var givers = Array.prototype.slice.call( arguments, 1 );

		givers.forEach( function( giver ){

			Object.getOwnPropertyNames( giver )
				.forEach( function( key ){
					reciever[ key ] = fluent( giver[ key ] );
				});

		});

		return reciever;
	},
	privately: function extendPrivately( reciever /* ,givers... */ ){
		var givers = Array.prototype.slice.call( arguments, 1 );

		reciever._private = {};

		givers.forEach( function( giver ){

			Object.getOwnPropertyNames( giver )
				.forEach( function( key ){
					reciever._private[ key ] = giver[ key ];
				});
		});

		return reciever;
	}
});

function unique( arr, prop ){
	return arr.reduce(function( ret, item ){
		if( prop && item[prop] ){
			item = item[ prop ].toString();
			if( ret.indexOf( item ) < 0 ) ret.push( item );
		}
		return ret;
	}, []);
}

function join( parent, child, key ){
	var children = child.reduce(function( obj, item ){
		obj[ item._id.toString() ] = item;
		return obj;
	}, {});

	return parent.map(function( item ){
		item[ key ] = children[ item[ key ].toString() ];
		return item;
	});

}

/**
 * inject
 *
 * this function takes a function, reads it's arguments
 * and requires any arguments from the start index. If the function
 * is a class constructor it will pass req and res to the constructor
 *
 * @param   {Request}   req     node js server request object
 * @param   {Response}  res     node js server response object
 * @param   {Function}  fn      function to inject
 * @param   {Integer}   start   start index to inject from
 * @param   {boolean}   call    callback:optional
 *
 * @returns {Array|Function}    array of injections or callback with
 *                              injections applied.
 */
function inject( req, res, fn, start, call ){

	// if not passing req and res, restructure the arguments
	if( arguments.length !== 5 ){
		fn      = arguments[0];
		start   = arguments[1];
		call    = arguments[2];
		req     = null;
		res     = null;
	}

	var requires = fn.toString()
		.match( /function.*\(([^\)]+)/ )[ 1 ]
		.replace( /\s/gm, '' )
		.split(',')
		.slice( start || 0 )
		.map( function( dep ){
			var _dep = require( LIB_DIR + dep );

			// check if it's a class constructor
			if( !!_dep.prototype && !!_dep.prototype.constructor && _dep.prototype.constructor === _dep ){
				if( !req && !res ) return new Error('Must pass req and res when injecting with constructors');
				return new _dep( req, res );
			}
			return _dep;
		});

	return call
		? fn.apply( this, requires )
		: requires;

}