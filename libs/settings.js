global.LIB_DIR      = APP_DIR + 'libs\\';
global.MODULE_DIR   = APP_DIR + 'libs\\modules\\';
global.MODEL_DIR    = APP_DIR + 'libs\\models\\';
global.PUBLIC_DIR   = APP_DIR + 'libs\\public\\';
global.TEMPLATE_DIR = APP_DIR + 'libs\\public\\templates\\';

module.exports = setting;

var settings = {
	mongo: {
		database:   'test',
		port:       27017,
		host:       '127.0.0.1'
	},
	session: {
		timeout:    1000 * 60 * 60,         // send a timeout warning if connection is still open
		stale:      1000 * 60 * 30,         // move session to mongo as the user is not active
		expire:     1000 * 60 * 60 * 4      // destroy the session and require user to log in
	},
	cache: {
		template: 1000 * 60
	}
};

function setting( prop ){

	var
		props   = prop.split(/[\/\.]/),
		_prop   = null,
	    curr    = settings;

	while( props.length ){
		_prop = props.shift();
		curr = curr[ _prop ];
	}

	return curr;
}