var
	fs    = require( 'fs' ),
	parse = require( 'url' ).parse,
	join  = require( 'path' ).join;


module.exports = serveStatic;

function serveStatic( url, res ){

	var
		url = parse( url, true, true ),
		pathname = url.pathname,
		path,
	    match;

	if( (match = pathname.match(/\.(js|css|html)$/)) ){

		switch( match[1] ){
			case 'js':
			case 'css':
				pathname = pathname.split('/');
				pathname = pathname[ pathname.length -1 ];
				path = join( PUBLIC_DIR, 'assets/css/', pathname );
				break;
			case 'html':
				path = join( PUBLIC_DIR, 'templates', pathname );
				break;
		}
	} else {
		return false;
	}


	fs.stat( path, function( err, stat ){
		if( err ){
			if( err.code == 'ENOENT' ){
				send404( res, err );
			} else {
				send500( res, err );
			}
		} else {
			res.setHeader( 'Content-Length', stat.size );
			var stream = fs.createReadStream( path );
			stream.pipe( res );
			stream.on( 'error', send404.bind( this, res ) );
		}
	});


	function send404( res, err ){
		res.statusCode = 404;
		res.end( 'File Not Found' );
	}

	function send500( res ){
		res.statusCode = 500;
		res.end( 'Internal Server Error' );
	}

}