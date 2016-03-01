var MIMES = {
	html: 'text/html',
	text: 'text/plain',
	json: 'application/json',
	xml : 'application/xml'
};

var STATUSCODES = {
	404: 'Unable to find file'
};

// Response needs to be wired into the chain
module.exports = function Response( req, res ){

	var props = {
		status: 200,
		mime: 'html',
		url: null,
		template: null,
		vars: {}
	};

	return {
		url:        getSet('url',       null,       props ),
		status:     getSet('status',    200,        props ),
		mime:       getSet('mime',      'html',     props ),
		template:   getSet('template',  'index',    props ),
		/**
		 * send the final response with the correct mime type and status code
		 */
		end: fluent(function end( data ){

			if( res.mime ){
				res.setHeader( 'Content-Type', MIMES[ res.mime ] );
				res.statusCode = props.status;
				res.end( props.template ? template : data );
			}
		}),
		/**
		 * send a fail response using a status code
		 */
		fail: fluent(function fail( status, message ){

			res.setHeader( 'Content-Type', 'text/plain' );
			res.statusCode = status;
			res.end( message || STATUSCODES[ status ] );

		}),
		/**
		 * re-route the request through the system
		 */
		redirect: fluent(function redirect( url, params ){
			props.url = url;
			extend( props.vars, params );
		}),
		/**
		 * add properties to the response
		 */
		add: fluent(function( /* data... */ ){

			var args = Array.prototype.slice.call( arguments, 0 );

			args.forEach(function(arg){
				extend( props.vars, arg );
			});

		})

	}

};

var fs = require( 'fs' );

module.exports = Template;

var PAGES = {};

function Template( name, opts ){
	this.name = name;
	extend( this, opts || {} );
	this.templateVars = {};
	// this.path.push(name);
	this._template = __dirname + '/public/templates/' + this.path.join( '/' ) + '.html';
	this._html = null;
	this.done = false;
};

extend( Template, {
	init: fluent( function( req, res ){
		this.req = req;
		this.res = res;
	} ),
	get : fluent( function( name, params ){

		if( PAGES[ name ] == null )
			PAGES[ name ] = new Template( name, params );
		else
			PAGES[ name ].templateVars = {};

		return PAGES[ name ];
	} )
} );

var REGEX = [
	{
		reg: /("|')/gm,
		rep: '\\$1'
	},
	{
		reg: /([\(\[].*[\]\)])/gm,
		rep: butFirst( unescapeParenthesis )
	},
	{
		reg: /(\r|\t)/gm,
		rep: ''
	},
	{
		reg: /\{\{foreach\s(\w+)\sas\s(\w+)}}\n+([\s\S]+)\n+\{\{\/foreach}}/gim,
		rep: butFirst( foreach )
	},
	{
		reg: /\{\{(include[^}]+)}}/gim,
		rep: "' + fn.$1 + '"
	},
	{
		reg: /\{\{\$*\s*([^}]+)\s*}}/gim,
		rep: "' + vars.$1 + '"
	},
	{
		reg: /\$/gim,
		rep: "vars."
	}
];

Template.prototype = {
	template: function( path ){

		if( path )          return this._template = path;
		if( !this._html )   generateTemplate.call( this );

		return this._html( this.templateVars, { include: include } );
	},
	add     : function( vars ){
		if( !vars ) return false;

		extend( this.templateVars, vars );
	}
};

function templatify( str, namespace ){
	return str.replace( /\{\{([^}]+)}}/gm, "' + $1 + '" )
		.split( '\n' )
		.join( '' );
}

function butFirst( fn ){
	return function(){
		return fn.apply( null, Array.prototype.slice.call( arguments, 1 ) );
	}
}

function foreach( plural, single, body ){
	return "' + (vars." + plural + ".reduce(function( str, " + single + " ){" +
	       " return str += '" + templatify( unescapeParenthesis( body ), single ) + "' " +
	       "}, '')) + '";
}

/**
 * this function will create an executable template function
 */
function generateTemplate( template ){
	var
		stream = fs.readFileSync( template || this._template ),
		html = stream.toString();

	html = REGEX.reduce( function( html, regex ){

		return html.replace( regex.reg, regex.rep );

	}, html ).split( '\n' ).join( '' );

	// html = unescapeParenthesis( html );

	console.log( html );

	this._templateText = "'" + html + "'";
	this._html = new Function( "vars, fn", "return " + this._templateText );
}

function unescapeParenthesis( parens ){
	return parens.replace( /\\('|")/gm, '$1' );
};

function include( path, params ){
	return path + ( params ? JSON.stringify( params ) : '');
}