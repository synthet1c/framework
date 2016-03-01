const
	fs = require( 'fs' );

module.exports = TemplateFactory;

var
	templates = {},
	config = {
	  minify: false,
	  index: 'index'
  };

	function TemplateFactory( name ){

		var
			path            = name.replace( /[\.\/]+/gm, '\\' ),
			templatePath    = __dirname + '\\public\\templates\\' + path + '.html',
			html            = fs.readFileSync( templatePath ).toString(),
			scope           = [ 'include', 'window', 'global', 'vars' ],
			structure       = {
				foreach: []
			},
			templateArr = execTemplate( createTemplateArray( html ), structure, scope ),
			templateFn  = createFunction( name, templatePath, templateArr, html );

		return templateFn;

	}


	function createTemplateArray( template, minify ){

		return template
			.split( (config.minify ? /[\n\t\r]+/: /[\n\r]+/) )
			.filter( function( curr ){
				return curr !== '' && curr !== ' ';
			});
	}


	function execTemplate( templateArr, structure, scope ){

		return templateArr.map(function( line, ii ){

			var match;

			// find the mustache brackets'
			line = line.replace( /(\{\{[^}]+}})/gm, function( matches, match ){

				match = match.replace( /\{\{foreach\s([^ ]+)\sas\s([^ ]+)}}/gm, function( fematches, from, as ){

					scope.push( as, config.index ); // add the as property to the scope

					from = setScope( scope, from ); // set the correct scope

					structure.foreach.unshift({
						from: from,
						as  : as
					});

					return "' + (" + from + ".reduce(function( ret, " + as + ", " + config.index +" ){ ret += '";

				});

				match = match.replace( /\{\{(\/|end)foreach}}/gm, function(){

					var foreach = structure.foreach.pop(); // first in first out
					scope.splice( scope.indexOf( foreach.as ) );
					scope.splice( scope.indexOf( config.index ) );

					return "'; return ret;}, '')) + '"; // close the reduction
				});

				// scope variables and functions
				match = match.replace( /\{\{([^}]+)}}/gm, function( varMatches, varMatch ){

					return "' + " + setScope( scope, varMatch ) + " + '";

				});

				return match;

			});

			return line;

		});

	}
	/**
	 * _createFunction
	 *
	 * this helper will convert the string template into an executable
	 * function
	 *
	 * @param   {String}    path            path to the template module
	 * @param   {Array}     templateArr     template split into an array
	 * @returns {Function}
	 */
	function createFunction( name, path, templateArr, html ){

		var
			template = "'" + templateArr.join( "'\n+'" ) + "'",
		  templateFn;

		path = path.replace( /\.html$/, '.js' );

		fs.writeFileSync( path, 'module.exports = function( error, include, vars ){\n\tvar template;\n\n\ttry{\n\t\ttemplate = \'\'\n+' + template + '\n\t} catch( e ){\n\t\ttemplate = error(e);\n\t}\n\treturn template;\n};' );

		// force require to rebuild the file
		require.cache[ path ] = null;

		templateFn = templates[ name ] = require( path ).bind( this, errorTemplate.bind(this, html), include(TEMPLATE_DIR) );

		return templateFn;
	}

	function include( path ){
		return function( file ){
			var inc = fs.readFileSync( path + file ).toString();
			return inc;
		}
	}

	/**
	 * setScope
	 *
	 * this function will ensure the variables and functions in the
	 * template have the correct scope, or prepend the 'vars' global scope
	 *
	 * @param   {Array}     scope       current scope of the template
	 * @param   {String}    str         current var or function string from template
	 *
	 * @returns {string}                var or function string with the correct scope
	 */
	function setScope( scope, str ){

		var spl, filtered, parens;

		if( (parens = str.match(/([^\(]+)(\([^\)]*\))/) ) ){
			str      = parens[1];
			parens   = parens[2];
		}

		spl = str.split('.');

		filtered = scope.filter( function( key ){

			return spl.indexOf( key ) > -1;

		}).reverse();

		if( !filtered.length ){
			spl.unshift( 'vars' );
		}

		return parens
			? spl.join('.') + parens
			: spl.join('.')

	}

	/**
	 * errorTemplate
	 *
	 * this function will return a formatted html page to display the
	 * error information, if template compilation fails.
	 *
	 * @param   {Object}    html    context of this in the template
	 * @param   {Error}     e       compilation error
	 *
	 * @returns {String}            error template html page
	 */
	function errorTemplate( html, e ){

		var
			stackStr = e.stack,
			stack    = stackStr.split( /\n/ ).join( '</li><li>' ),
			error    = e.stack.match( /TypeError\:\s(?:Cannot\sread\sproperty\s\'([^']+)|([a-zA-Z0-9_\.]+)\sis\snot\sa\sfunction)/ ),
			style    = 'body{background:#444;color:#999}pre{background:#333;padding: 1em;color:#aba}.e{color:#FF336D;border-bottom: 2px dotted #f36;}.b{ color:#7DC1D8;}.k{color: #DA57A8}.t{color: #A09D64}',
			template = html
				.replace( /</gm, '&lt;' )
				.replace( /\\n/gm, '' )
				.replace( /\t/gm, '    ' )
				.replace( /\&lt\;([a-z._0-9]+|\/[a-z._0-9]+)/gm, '&lt;<b class="t">$1</b>' )
				.replace( /\{\{([^\}]+)}}/gm, function( matches, match ){

					match = match.replace( /(\/foreach\b|\bforeach\b|\bas\b)/gmi, function( keywords, keyword ){
						return '<b class="k">' + keyword + '</b>';
					});

					return '<b class="b">{{' + match + '}}</b>'
				});

		error.shift();
		error        = error.filter( function( err ){ return err != null});

		template = template.replace( new RegExp( "([a-z0-9_\.]+" + error[ 0 ].replace( /[\.]/, '\\$1' ) + ")" ), '<b class="e">$1</b>' );

		return ''
			+ '<!DOCTYPE html><html lang="en">'
			+ '<head><meta charset="UTF-8">'
			+ '<title>Document</title>'
			+ '<style>' + style + '</style>'
			+ '</head><body>'
			+ '<h2>oops... there was an error</h2>'
			+ '<ul>'
			+ '<li>' + stack + '</li>'
			+ '</ul>'
			+ '<pre>' + template + '</pre>'
			+ '</body></html>';
	}

	function bind( fn /*, boundArgs */ ){
		var boundArgs = Array.prototype.slice.call(arguments, 1);
		return function( /* passed args */){
			var passedArgs = Array.prototype.slice.call(arguments, 0);
			return fn.apply(this, boundArgs.concat( passedArgs ));
		}
	}

	/**
	 * traverse
	 *
	 * this function will either create or return a nested object
	 * from a dot separated string.
	 *
	 * @param   {String}    name        name of the nested property **dot separated**
	 * @param   {Object}    from        object to nest from
	 * @param   {*}         value       optional: value to set
	 *
	 * @returns {Object}                nested object
	 */
	function traverse( name, from, value ){

		var path = name.split('.');

		return path.reduce( function( ret, curr, ii ){

			if( typeof ret[ curr ] === 'undefined' ){
				ret[ curr ] = {};
			}

			if( ii === path.length - 1 && value ){
				ret[ curr ] = value;
			}

			return ret[ curr ];

		}, from );

	}