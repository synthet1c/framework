function before( beforeFn ){
	return function( afterFn ){
		var args = slice(arguments);
		beforeFn.apply(this, args);
		return afterFn.apply(this, args);
	}
}

function after( afterFn ){
	return function( beforeFn ){
		var args = butFirst(arguments);
		afterFn.apply(this, args);
		return beforeFn.apply(this, args);
	}
}

function onlyAfter( beforeFn ){
	return function( afterfn ){
		var args = butFirst(arguments);
		if( beforeFn.apply(this, args)){
			return afterfn.apply(this, args);
		}
		return false;
	}
}


function auth( id, cb ){
	var self = this;

	db.find(_id(id), function( user ){
		if( USERS[ id ]){
			return cb.apply( self )
		}
		return Auth.login();
	});
}

var test = {
	stuff: auth( id, function(){

	})
}