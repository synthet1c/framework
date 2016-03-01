var MongoClient = require( 'mongodb' ).MongoClient;
var myDb;

module.exports = connection;

/**
 * will reuse connection if already created
 */
function connection( callback ){

	if( myDb == undefined ){
		MongoClient.connect( 'mongodb://127.0.0.1:27017/test', function( err, db ){

			if( err ) throw err; // unable to connect. kill the app

			callback( ( myDb = db ) );
		} );
	} else {
		callback( myDb );
	}
}