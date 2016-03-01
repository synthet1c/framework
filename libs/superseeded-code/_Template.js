var fs          = require('fs' );
    //chokidar    = require( 'chokidar' );

module.exports = Template;

var PAGES = {};

function Template( name, opts ){

	extend( this, opts || {}, {
		name: name,
		templateVars: {},
		_html: null
	});

	var path = isArray(this.path) ? this.path.join( '/' ) : this.path;
	this._template = __dirname + '/public/templates/'+ path +'.html';
};

extend( Template, {
	get: fluent(function( module, name, params ){

		if( module && PAGES[ module ] == null ) PAGES[ module ] = {};

		if( module && name ){

			if( PAGES[ module ][ name ]){
				PAGES[ module ][ name ].templateVars = {};
			} else {
				PAGES[ module ][ name ] = new Template( name, params );
			}
		} else {

			if( PAGES[ name ] ){
				PAGES[ name ].templateVars = {};
			} else {
				PAGES[ name ] = new Template( name, params );
			}
		}

		return module ? PAGES[ module ][ name ] : PAGES[ name ];
	})
});

var REGEX = [
	{
		reg: /("|')/gm,
		rep: '\\$1'
	},
	{
		reg: /([\(\[].*[\]\)])/gm,
		rep: butFirst(unescapeParenthesis)
	},
	{
		reg: /(\r|\t)/gm,
		rep: ''
	},
	{
		reg: /\{\{foreach\s([a-zA-Z\.-_]+)\sas\s(\w+)}}([\s\S]+)\{\{(?:end|\/)foreach}}/gim,
		rep: butFirst(foreach)
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

		if( !!this.req && !!this.req.mime ){
			this.res.setHeader( 'Content-Type', 'application/' + this.req.mime );
			this.res.statusCode = 200;
			return JSON.stringify( this.templateVars );
		}

		if( path )          return this._template = path;
		if( !this._html )   {
			generateTemplate.call( this );
			this.watcher = regenerateTemplate( this );
		}

		// this.res.setHeader('Content-Type', 'text/html');
		this.res.statusCode = 200;

		var compiledTemplate;

		try {
			compiledTemplate = this._html( this.templateVars, { include: include } );
		} catch( e ){
			compiledTemplate = errorTemplate( e, this._template, this._templateText );

		}

		if( compiledTemplate instanceof Error ){
			compiledTemplate = errorTemplate( e, this._template, this._templateText );
		}

		return compiledTemplate;
	},
	add: fluent(function( vars ){
		if( !vars ) return false;

		extend( this.templateVars, vars );
	}),
	init: fluent( function( req, res ){
		this.req = req;
		this.res = res;
	})
};

function templatify( str, namespace ){
	return str.replace( /\{\{([^}]+)}}/gm, "' + $1 + '" )
		.split('\n')
		.join('');
}

function foreachify( str, namespace ){
	reg = /\+\s([a-zA-Z0-9-_]+)\.([a-zA-Z0-9-_]+)\s\+/gim;

	str = str.replace( /\{\{([^}]+)}}/gm, "' + $1 + '" )
		.replace(reg, function( matches, first, second){
			if( first !== namespace ){
				return '+ vars.' + first + '.' + second + ' +';
			}
			return matches;
		});

	return str;
}

function errorTemplate( e, path, text ){
	return '<!doctype html>' + '<html lang=\"en\"><head><link rel="stylesheet" href=\"error.css\"><meta charset=\"UTF-8\"><title>Compile Error</title></head><body><section class\="alert\"><h1>Opps... There was an error</h1><h3>' + e.message + '</h3><h4>' + path + '</h4><ul>' + (e.stack.split(/\bat\b/).reduce( function( res, stack ){return res += '<li>' + stack + '</li>'}, '' )) + '</ul><pre>' + text.replace(/(<)/gm, '&lt;') + '</pre></section></body></html>';
}

function butFirst( fn ){
	return function(){
		return fn.apply( null, Array.prototype.slice.call( arguments, 1 ));
	}
}

function foreach( plural, single, body ){
	return "' + (vars." + plural + ".reduce(function( str, " + single + " ){" +
	       " return str += '" + foreachify( unescapeParenthesis( body ), single ) + "' " +
	       "}, '')) + '";
}

/**
 * regenerateTemplate
 *
 * this function is firing too much when using phpstorm as I
 * could not disable the autosaving feature and too many errors
 * will be thrown from uncompilable javascript.
 *
 * TODO: maybe make the templates refreshable at a specific url
 *
 * @param   {Template}    self  template to refresh
 * @returns {*}
 */
function regenerateTemplate( self ){

	return false;

	console.log( self._template );

	return chokidar.watch( self._template )
		.on( 'change', function( path, stat ){
			console.log( 'change', path );
			console.log( 'ctime:', stat.ctime.getTime(), ' mtime:', stat.mtime.getTime() );
			console.log( 'diff: ', stat.mtime.getTime() - stat.ctime.getTime())
		})
		.on( 'error', function( error ){
			console.log( 'Error happened', error );
		});
}

/**
 * this function will create an executable template function
 */
function generateTemplate( template ){
	var
		stream  = fs.readFileSync( template || this._template ),
		html    = stream.toString();

	html = REGEX.reduce(function( html, regex ){

		return html.replace( regex.reg, regex.rep );

	}, html ).split('\n')

	html = html.join('');

	this._templateText  = "'" + html + "'";
	console.log( this._templateText );

	writeToFile.call(this);

	var jsFile = this._tmplPath;
	console.log('jsFile', jsFile );

	try {
		// this._html = new Function( "vars, fn", "return " + this._templateText );
		this._html = require( this._tmplPath );
	} catch ( e ){
		console.log( 'unable to compile template' );
		this._html = errorTemplate( e, this._template, this._templateText );
	}
}

function writeToFile(){

	this._tmplPath = this._template
		.replace( /html/, 'js' )
		.replace( /\\/gm, '/' );

	fs.writeFileSync( this._tmplPath, 'module.exports = function( vars, fn ){\n\tvar template;\n\n\ttry{\n\t\ttemplate = ' + this._templateText + '\n\t} catch( e ){\n\t\tthrow e;\n\t}\n\treturn template;\n};' );
}

function unescapeParenthesis( parens ){
	return parens.replace( /\\('|")/gm, '$1' );
};

function include( path, params ){

	try {
		var file = fs.readFileSync( TEMPLATE_DIR + path );

	} catch( e ){

		return '[ UNABLE TO LOAD INCLUDED FILE ' + TEMPLATE_DIR + path + ' ]';

	}

	return file.toString();
}