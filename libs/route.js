var
	fs          = require('fs'),
    Template    = require('./Template');

var
	/**
	 * ROUTES
	 *
	 * this object holds all of the application routes. it is broken
	 * into request methods to reduce the size of the loop to find the
	 * correct route.
	 */
	ROUTES = {
		GET     : {},
		POST    : {},
		PATCH   : {},
		PUT     : {},
		DELETE  : {}
	},

	/**
	 * ROUTES_BY_NAME
	 *
	 * this object holds pointers to the routes indexed by the dot separated
	 * string to identify the route. This is used to allow firing routes without
	 * using regular expression to find the correct route.
	 */
	ROUTES_BY_NAME = {},

	/**
	 * STATE
	 *
	 * this object holds the current state of the application. (current route)
	 */
    STATE,

	/**
	 * URL_REGEX
	 *
	 * this object holds the regular expression for the Route class
	 */
	URL_REGEX = [
		{   // string
			reg: /(?:(\w+):(str))/g,
			rep: '([a-z-_]+)'
		},
		{   // integer
			reg: /(?:(\w+):(int))/g,
			rep: '([0-9]+)'
		},
		{   // anything
			reg: /:([^\/]+)/g,
			rep: '([^\/]+)'
		}
	];

/**
 * Route.route
 *
 * this function will generate a new route
 *
 * @param {String}  url         url to match route with placeholders
 * @param {*}       ctrl        controller to handle route, can be function or string
 * @param {String}  method      optional: method of controller to call. Singular naming convention
 * @param {String}  module      optional: module to user for controller
 * @param {String}  template    optional: template name if different from controller name
 */
exports.route = function route( url, ctrl, method, module, template ){

	var
		routed  = regexUrl( url ),
	    path    = [];

	method = method || 'GET';       // default to GET

	if( module ) path.push(single(module));
	path.push( template || ctrl );

	// add the new route to the ROUTES object by method
	ROUTES[ method ][ routed.url ] = {
		url:        url,
		captures:   routed.captures,
		ctrl:       ctrl,
		method:     method,
		module:     module,
		path:       path,
		template:   template || ctrl,
		types:      routed.types
	};
	// save a reference to the route by name so we can easily use the redirect function
	ROUTES_BY_NAME[ lc(module + '.' + ctrl) ] = ROUTES[ method ][ routed.url ];
};

exports.run = function( url, method ){

	return matchUrl( url, method );
};


/**
 * restful
 *
 * this function will create a restful resource from the basic information
 * provided as arguments
 *
 * @param {String}  name        name of the module to route
 * @param {String}  Controller  name of the controller to handle the route
 * @param {Array}   routes      extra routes to add to the restful resource
 *
 * @returns void;
 */
exports.restful = function( name, Controller, routes ){

	Controller = require( MODULE_DIR + name + '\\controller' );

	routes = [
	   /*/ - method -- fn --'---- url -------- /*/
		[   'GET',    'index',   null          ],
		[   'GET',    'create',  '/create'     ],
		[   'GET',    'show',    '/:id'        ],// :id     int|str|ObjectID    user id or name
		[   'PUT',    'store',    null         ],
		[   'GET',    'edit',    '/:id/edit'   ],// :id     int|ObjectID    user id to edit
		[   'PATCH',  'update',  '/:id'        ],// :id     int|ObjectID    user id to edit
		[   'DELETE', 'destroy', null          ] // _id     int|ObjectID    user id to destroy
	   /*/ - method -- fn ------ url -------- /*/
	].concat( routes || []);

	// call Route.route for each array element above
	routes.forEach(function( _route ){

		 var
			 method   = _route[0],
			 ctrl     = _route[1],
			 url      = _route[2] === null
									? '/' + name + 's*'
									: '/' + name + 's*' + _route[2];

		exports.route.call( this, url, ctrl, method, name, null, Controller );
	});
};

exports.routes = exports.restful;

exports.router = function router( req, res ){

	var match;

	if( ( match = matchUrl( req, res ) ) ){

		// call the controller. if false is returned there was an error
		if( match.ctrl.apply(this, match.args ) === false ){

//			res.statusCode = 200;
//			res.setHeader( 'Content-Type', 'application/json' );
//
//			return res.end( JSON.stringify({
//				error: 'there\'s some motherfuckin snakes on this mother fuckin plane'
//			}));
		}
	}
};

/**
 * redirect
 *
 * this function will redirect a request to another route as identified
 * with a dot seperated list of available routes
 *
 * @param   {Request}   req     node js request object
 * @param   {Response}  res     node js response object
 * @param   {String}    path    dot separated string
 * @param   {Object}    params  object of parameters to pass to the new route
 * @param   {Array}     includes optional: array of keys to retrieve from the params and includes
 */
exports.redirect = function( req, res, path, params, includes ){

	var
		routeName   = path,
		path        = path.split('.'),
		modules     = plural(path[0]),
		module      = single(path[0]),
		name        = path[1] || 'index',
		ctrl        = require(MODULE_DIR +  module + '/controller')[ name ];

	var _route = ROUTES_BY_NAME[ routeName ];

	params = !Array.isArray(params)
		? [params]
		: params;



	var uri = _route.path.reduce(function( uri, param, ii ){
		return uri.replace( new RegExp(':' + _route.captures[ii]), params[ii]);
	}, _route.url.replace( /s*\*/gm, ''));

	// NOTE: node cannot change headers after they have been sent
	// this delays writing the header until the processing of the
	// request has completed and the template or json is ready to
	// be served
	res.rewrite = {
		status: 303,
		url: uri
	};

	req.method = _route.method || 'GET';

	var
	    template,
	    // default dependencies
	    len       = ctrl.length,
	    deps      = [ req, res ],
	    targetLen = 2;

	// if using GET include the template in the dependencies
	if( req.method === 'GET'){
		template = Template.get( routeName, req, res );

		deps.push( template );
		targetLen = 3;
	}

	if( len > targetLen ){
		// inject additional dependencies into the calling controller function
		var requires = inject( req, res, ctrl, targetLen, false );

		deps = deps.concat( requires );
	}

	// TODO: include default parameters
	// should include any params from the route to simulate a url request
	return ctrl.apply( this, deps ).apply(this, params || [] );

};

/**
 * This method is called on each request to find the appropriate route
 * the user has requested
 *
 * @param   {Request}   req     node js request object
 * @param   {Response}  res     node js response object
 * @returns {*}
 */
function matchUrl( req, res ){
	var
		url     = req.url,
		method  = req.method,
		params  = {},
	  args    = [],
		key, match, parsed, ctrl, route;

	// check all routes with the same method
	// TODO: filter the routes by the number of slashes to reduce the loop further
	for( key in ROUTES[ method ] ) {
		// match the full url by adding ^ `start` and $ `end` to stop false positives
		if( (match = url.match( new RegExp( '^' + key + '$' ) )) ){

			route = ROUTES[ method ][ key ];

			args = Array.prototype.slice.call( match, 1 );

			params = route.captures.reduce(function( obj, item, ii ){

				var val = args[ii];

				// auto parse integers
				obj[ item ] = (parsed = parseInt( val )) == val
					? parsed
					: val;

				return obj;
			}, params);

			// calling a method on a controller
			if( isString( route.ctrl ) ){

				var
					modCtrl = require( './modules/' + lc( route.module ) + '/controller' ),
				  template,
				  // default dependencies
				  _ctrl = modCtrl[ route.ctrl ],
				  len   = _ctrl.length,
				  deps  = [ req, res ],
				  targetLen = 2;

				// only GET requests require a template
				if( route.method === 'GET'){
					template = Template.get( lc( route.module ) + '.' + route.template, req, res );

					deps.push( template );
					targetLen      = 3;
				}

				if( len > targetLen ){
					// inject dependencies into the calling controller function
					var requires = inject( req, res, _ctrl, targetLen, false);

					deps = deps.concat(requires);
				}

				ctrl = _ctrl.apply(this, deps);


			} else {
				ctrl = route.ctrl;
			}

			// set the current state
			STATE = {
				url : route.url,
				ctrl :  ctrl,
				method: method,
				args: args,
				params: params
			};

			return STATE;
		}
	}

	return false;       // did not find an appropriate route
}

/**
 * this function will replace a placeholder url with regex and save
 * the information about captures and their types
 *
 * @param   {string}    url     url with/:placeholders
 *
 * *types of url*
 * + /resource:int      only match an integer
 * + /resource:string   only match a string
 * * /:resource         match anything
 *
 * @returns Object<mixed>       capture groups from the url and the type str|int|null
 */
function regexUrl( url ){

	var
		key,
		captures = [],
		types = [];

	URL_REGEX.forEach(function( item ){
		url = url.replace( item.reg, function( matches, word, type ){
			captures.push( word );
			types.push( type );

			return item.rep;
		});
	});

	return {
		url: url,
		captures: captures,
		types: types
	};

}