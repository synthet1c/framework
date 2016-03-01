module.exports = Schema;

function Schema(){

}

Schema.int = variadic( function( _default, size, rest/*...*/ ){
	return function( val ){
		handleRequirements.call( this, rest );

		return ifInstance( Number, val, _default );
	}
}, 2 );

Schema.string = function( _default, size, rest/*...*/ ){
	return function( val ){
		return ifInstance( Number, val, _default ) && size ? val.length <= size : true;
	}
};

Schema.date = variadic( function( _default, rest/*...*/ ){
	return function( val ){
		return ifInstance( Date, val, _default );
	}
} );

Schema[ 'enum' ] = variadic( function( arr, rest/*...*/ ){
	return function( val ){
		return arr.indexOf( val ) > -1
			? val
			: (Schema.error( 'must provide on of [' + arr.join() + ']' ), null);
	}
} )

Schema.email = variadic( function( _default, rest/*...*/ ){
	return function( val ){
		return isEmail( val )
			? val
			: null;
	}
} );

Schema.error = function( val ){

	switch( typeof(val) ){
		case 'string':
			throw new Error( 'must provide a string: ' + val + ' provided' );
			break;
		case 'number':
			throw new Error( 'must provide a number: ' + val + ' provided' );
			break;
		default:
			if( val instanceof Array )
				throw new Error( 'must provide one of [' + val.join() + ']' );
	}
	throw new Error( val );
};

Schema.obj = function( props ){

	return new GetSet( props );
}

Schema.prototype = {
	construct: function(){
		for( var key  in this ) {
			if( !isArray( this[ key ] ) && isObject( this[ key ] && this.hasOwnProperty( this[ key ] ) ) ){
				this[ key ] = new GetSet( key, this[ key ] );
			}
		}
	}
}

function GetSet( parent, key, props ){
	this.parent = parent;
	this.key = key;
	this.props = props;
}

GetSet.prototype = {
	get   : function( prop ){
		return this.parent[ this.key ][ prop ]();
	},
	all   : function(){

	},
	update: function( prop, value ){
		return this.parent[ this.key ][ prop ]( value )
	},
	save  : function(){

	},
	drop  : function( prop ){
		return this.parent[ this.key ][ prop ]( null );
	}
};

function schema( self ){
	return {
		int   : function(){
		},
		enum  : function(){
		},
		obj   : function(){
		},
		string: function(){
		},
		date  : function(){
		}
	}
}

function ifInstance( instance, val, _default ){
	return val instanceof instance
		? val
		: _default;
}