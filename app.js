// require files for app

require('./libs/utils');
require('./libs/functional');

// require('./libs/watch-file');

global.APP_DIR = __dirname + '\\';

var
	http        = require('http'),
	Request     = require('./libs/route'),
	setting     = require('./libs/settings'),
	UserCtrl    = require( MODULE_DIR + 'user\\controller'),
	qs          = require('querystring'),
	serveStatic = require('./libs/serve-static'),
	Response    = require('./libs/response');

//Request.route('/name:str/age:int', function( id ){
//
//	console.log( 'route :int', id );
//});

//Request.route('/name:str', function( name ){
//
//	console.log( 'route :str', name );
//});

Request.restful('user', 'UserCtrl' );
Request.restful('post', 'PostCtrl' );
Request.restful('product', 'ProductCtrl' );
Request.restful('project', 'ProjectCtrl', [
	[ 'GET', 'tasks', '/:project/tasks' ],
	[ 'GET', 'task', '/:project/:task' ],
	[ 'GET', 'taskedit', '/:project/:task/edit' ],
	[ 'GET', 'taskcreate', '/:project/task/create' ],
	[ 'PUT', 'taskstore', '/:project/task/create' ],
	[ 'PATCH', 'taskupdate', '/:project/:task']
]);

Request.routes('login', 'LoginCtrl', [
	[ 'GET',    'index',    null  ],
	[ 'POST',   'login',    null  ],
	[ 'DELETE', 'logout',   null  ]
]);


// set up server
var server = http.createServer(function( req, res ){

	var match;
	// check request serve static files

	req.meta = { start: Date.now() };

	// check route
	if( req.method === 'POST'){

		return add(req, res, function( params ){
			Request.router( req, res );
		});

	} else {

		if( req.url.match(/\.ico/)){
			return false;
		}

		if( req.url.match(/\.(js|css|html)$/) ){
			return serveStatic( req.url, res );
		}

		if( (match = req.url.match(/(.*)\.(json|xml)/)) ){

			var
				mime    = match[2];

			req.url     = match[1];
			req.mime    = mime;
		}

		Request.router( req, res );
	}

	// parse request params

	// check authority

	// get data

}).listen(3333);


function add( req, res, ready ){
	var
		body = '',
		items = [];
	req.setEncoding( 'utf8' );
	req.on( 'data', function( chunk ){
		body += chunk
	});
	req.on( 'end', function(){
		var params = req.params = qs.parse( body );
		if( ['DELETE', 'PUT', 'PATCH'].indexOf( params.method ) > -1 ){
			req.method = params.method;
			delete params.method;
		}
		ready( params );
	});
}