// var Worker = require('webworker-threads' ).Worker;

/** Function Decorators **/
global.curry        = curry;
global.compose      = compose;
global.variadic     = variadic;

/** Method Decorators **/
global.fluent       = fluent;
global.getSet       = getSet;

/** Array **/
var
	__slice     = global.__slice      = Array.prototype.slice,
	__splice    = global.__splice     = Array.prototype.splice,
	__map       = global.__map        = Array.prototype.map;

/** Functional Arrays **/
global.map          = curry(map);
global.mapWith      = curry(flip(map));
global.get          = curry(get);
global.getWith      = curry(flip(get));
global.pluckWith    = compose(getWith, mapWith);

function curry( fn ){

	var
		len     = fn.length,
		args    = [];

	return function _curry(){

		args = args.concat( __slice.call( arguments, 0 ) );

		return args.length >= len
			? fn.apply( this, args )
			: _curry;
	}
}

function flip( fn ){
	return function _flip( /*arguments*/ ){
		var args = __slice.call(arguments);
		fn.apply( this, args.reverse() );
	}
}

function compose( a, b ){
	return function( c ){
		return a( b( c ) );
	}
}

function get( arr, prop ){
	return arr[ prop ];
}

function map( arr, fn ){
	return __map.call( arr, fn );
}

function getSet( what, initial, proxy ){

	var self = proxy || this;

	if( initial ) self[ what ] = initial;

	return function( arg ){
		return arg
			? self[ what ] = arg
			: self[ what ];
	}
}


function fluent( methodBody, force ){
	return typeof(methodBody) !== 'function'
		? methodBody
		: _fluent;

	function _fluent(){
		var res;

		return (res = methodBody.apply( this, arguments ))
			? res
			: this;
	}
}

function variadic( fn, take ){
	var len = take || fn.length - 1;

	return function( /* args..., rest... */ ){
		var args = __slice.call( arguments, 0 ),
		    rest = args.splice( len );

		return fn.apply( this, args.concat( [ rest ] ) );
	}
}

/**
 * asyncMap
 *
 * this function will asynchronously map an array moving the processing
 * onto a worker thread and returning the result to a callback
 *
 * @param   {Array}     arr     Array to map
 * @param   {Function}  cb      callback for map function
 * @param   {Function}  done    callback when the process is complete
 */
function asyncMap( arr, cb, done ){

	var worker       = new Worker(function(){
		console.log('in the map worker');
		this.onmessage = function( event ){

			var
				arr = event.data.arr,
			    cb  = event.data.cb,
			    fn  = Function("return " + cb)();

			postMessage( arr.map( fn ) );
			self.close();
		};
	});
	worker.onmessage = function( result ){
		done.call( this, result.data );
		worker = null;
	};
	worker.postMessage({arr: arr, cb: cb.toString()});
}

/**
 * asyncReduce
 *
 * this function will reduce an array asynchronously moving the processing
 * onto a worker thread and returning the result to a callback
 *
 * @param   {Array}     arr     Array to reduce
 * @param   {Function}  cb      reduce function
 * @param   {*}         initial beginning value of reduction
 * @param   {Function}  done    callback once reduction is complete
 */
function asyncReduce( arr, cb, initial, done ){

	var worker       = new Worker(function(){
		console.log('in the map worker');
		this.onmessage = function( event ){

			var
				arr     = event.data.arr,
			    cb      = event.data.cb,
			    initial = event.data.initial,
			    fn  = Function("return " + cb)();

			postMessage( arr.reduce( fn, initial ) );
			self.close();
		};
	});
	worker.onmessage = function( result ){
		done.call( this, result.data );
		worker = null;
	};
	worker.postMessage({arr: arr, cb: cb.toString(), initial: initial});
}

var arr = [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ];

function keyPlus( key ){ return ++key }
function reduceTotal( ret, curr ){
	return ret += curr;
}

//asyncReduce( arr, reduceTotal, 0, function( result ){
//
//	console.log( result );
//});