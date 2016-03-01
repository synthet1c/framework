var chokidar = require( 'chokidar' );

// One-liner for current directory, ignores .dotfiles
chokidar.watch( './libs/public/templates')
	.on( 'change', function( path, stat ){
		console.log( 'change', path );
	});