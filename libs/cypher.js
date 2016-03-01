var
	crypto    = require( 'crypto' ),
    algorithm = 'aes-256-ctr',
    password  = 'P@55w0rd!';

exports.encrypt = encrypt;
exports.decrypt = decrypt;

function encrypt( text ){

	var
		cipher  = crypto.createCipher( algorithm, password ),
		crypted = cipher.update( text, 'utf8', 'hex' );

	crypted += cipher.final( 'hex' );
	return crypted;
}

extend( encrypt, {
	json: function( obj ){
		return encrypt(JSON.stringify( obj ));
	}
});

function decrypt( text ){

	var
		decipher = crypto.createDecipher( algorithm, password ),
		dec      = decipher.update( text, 'hex', 'utf8' );

	dec += decipher.final( 'utf8' );
	return dec;
}

extend( decrypt, {
	json: function( obj ){
		return JSON.parse( decrypt( obj ) );
	}
});