const
	fs = require('fs');

module.exports = Template;

	/**
	 * PAGES
	 *
	 * this object will store all of the compiled templates in their
	 * folder structure in the programs memory
	 *
	 * @type {Object}
	 */
	var PAGES = {};

	function __template__(){}


	/**
	 * @constructor Template
	 *
	 * this object will create a template
	 *
	 * @param   {string}    name        name and path of the template
	 * @param   {Object}    params      template to modify
	 */
	function Template( name, params ){

		name = name.replace('.', '/');

		var
			templatePath = __dirname + '/public/templates/' + name + '.html',
			stream = fs.readFileSync( templatePath ),
			html   = stream.toString();

		extend(this, {
			template: html,
			templateHTML: html,
			templatePath: templatePath,
			scope: ['vars', 'window'],
			vars: {},
			structure: {
				foreach: []
			}
		});

		this._compile();
	}

	/**
	 * @static methods
	 *
	 * all static Template methods are fluent by default
	 */
	extend.fluent( Template, {
		config: {
			minify: false,
			index: 'index'
		},
		get: function( name, req, res ){

			var page,
			    template;

			if(( page = reduceNest(name, PAGES) ) instanceof Template){
				template = page;
				template.reset();
			} else {
				template = reduceNest( name, PAGES, new Template( name ));
			}

			template.init( req, res );

			return template;
		},
		writeToFile: function( path, template ){

			path        = path || this.templatePath;
			template    = template || this.template;

			path = path
				.replace( /html/, 'js' )
				.replace( /\\/gm, '/' );

			fs.writeFileSync( path, 'module.exports = function( error, vars ){\n\tvar template;\n\n\ttry{\n\t\ttemplate = \'\'\n+' + template + '\n\t} catch( e ){\n\t\ttemplate = error(e, this );\n\t}\n\treturn template;\n};' );

			this.fetchFn = require( path ).bind(this, Template.errorTemplate);
			console.log( this.fetchFn );
		},
		errorTemplate: errorTemplate
	});

	/**
	 * @prototype methods
	 *
	 * all prototoype Template methods are fluent by default
	 */
	extend.fluent( Template.prototype, {
		get  : function( name ){

			var page = reduceNest( name, PAGES, 'this is a test' );
		},
		init : function( req, res ){

			this.req = req;
			this.res = res;
		},
		add: function( params ){
			extend( this.vars , params );
		},
		send: function(){

			if( !!this.req && !!this.req.mime ){
				this.res.setHeader( 'Content-Type', 'application/' + this.req.mime );
				this.res.statusCode = 200;
				return JSON.stringify( this.vars );
			}

			// this.res.setHeader('Content-Type', 'text/html');
			this.res.statusCode = 200;
			return this.fetchFn( this.vars );
		},
		reset: function( req, res ){
			this.req = req || null;
			this.res = res || null;
			this.vars = {};
		},
		_compile : function(){
			this._createTemplateArray();
			this._execTemplate();
			this._createFunction();
			Template.writeToFile.call( this );
		},
		fetch : function( vars ){
			document.write( this.fetchFn( vars ) );
		},
		_createTemplateArray: function(){

			this.templateArr = this.template
				.split( (Template.config.minify ? /[\n\t\r]+/: /[\n\r]+/) )
				.filter( function( curr ){
					return curr !== '' && curr !== ' ';
				});
		},
		_execTemplate : function(){

			var self = this;

			this.templateArr = this.templateArr.map(function( line, ii ){

				var match;

				// find the mustache brackets
				line = line.replace( /(\{\{[^}]+}})/gm, function( matches, match ){

					var changed = false; // this will be true if match has changed

					match = match.replace( /\{\{foreach\s([^ ]+)\sas\s([^ ]+)}}/gm, function( fematches, from, as ){

						changed = true;

						self.scope.push( as, Template.config.index ); // add the as property to the scope

						from = setScope( self.scope, from ); // set the correct scope

						self.structure.foreach.unshift( {
							from: from,
							as  : as
						});

						return "' + (" + from + ".reduce(function( ret, " + as + ", " + Template.config.index +" ){ ret += '";

					});

					match = match.replace( /\{\{(\/|end)foreach}}/gm, function(){

						changed = true;

						var foreach = self.structure.foreach.pop(); // first in first out
						self.scope.splice( self.scope.indexOf( foreach.as ) );
						self.scope.splice( self.scope.indexOf( Template.config.index ) );

						return "'; return ret;}, '')) + '"; // close the reduction
					});

					// scope variables and functions
					match = match.replace( /\{\{([^}]+)}}/gm, function( varMatches, varMatch ){

						return "' + " + setScope( self.scope, varMatch ) + " + '";

					});

					return match;

				});

				return line;

			});

			return self;

		},
		/**
		 * _createFunction
		 *
		 * this helper will convert the string template into an executable
		 * function
		 *
		 * @returns {Template}
		 * @private
		 */
		_createFunction : function(){

			this.template = "'" + this.templateArr.join( "'\n+'" ) + "'";

			this.fetchFn = Function( 'error, vars',
				'var template;try{template = ' + this.template + ';}catch(e){ template = error( e, this );}return template'
			).bind(this, errorTemplate );
		}

	});

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

		var
			spl = str.split( '.' ),
			filtered;

		filtered = scope.filter( function( key ){

			return spl.indexOf( key ) > -1;

		}).reverse();

		if( !filtered.length ){
			spl.unshift( 'vars' );
		}

		return spl.join( '.' );

	}

	/**
	 * errorTemplate
	 *
	 * this function will return a formatted html page to display the
	 * error information, if template compilation fails.
	 *
	 * @param   {Error}     e           compilation error
	 * @param   {Object}    context     context of this in the template
	 *
	 * @returns {String}                error template html page
	 */
	function errorTemplate( e, context ){

		var
			stackStr = e.stack,
			stack    = stackStr.split( /\n/ ).join( '</li><li>' ),
			error    = e.stack.match( /TypeError\:\s(?:Cannot\sread\sproperty\s\'([^']+)|([a-zA-Z0-9_\.]+)\sis\snot\sa\sfunction)/ ),
			style    = 'body{background:#444;color:#999}pre{background:#333;padding: 1em;color:#aba}.e{color:#FF336D;border-bottom: 2px dotted #f36;}.b{ color:#7DC1D8;}.k{color: #DA57A8}.t{color: #A09D64}',
			template = context.templateHTML
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
	 * reduceNest
	 *
	 * this function will either create or return a nested object
	 * from a dot separated string.
	 *
	 * @param   {String}    name        name of the nested property **dot separated**
	 * @param   {Object}    from        object to nest from
	 * @param   {=}         value       optional: value to set
	 *
	 * @returns {Object}                nested object
	 */
	function reduceNest( name, from, value ){

		name = name.split( '.' );

		var page = name.reduce( function( ret, curr, ii ){

			if( typeof ret[ curr ] === 'undefined' ){
				ret[ curr ] = {};
			}

			if( ii === name.length - 1 && value ){
				ret[ curr ] = value;
			}

			return ret[ curr ];

		}, from );

		return page;

	}