module.exports = function( vars, fn ){
	var template;

	try{
		template = '<!doctype html><html lang=\"en\"><head><meta charset=\"UTF-8\"><title>Login</title></head><body><form action=\"/login\" method=\"POST\"><input type=\"text\" name=\"user\" placeholder=\"username\" value=\"' + vars.user + '\" /><input type=\"text\" name=\"password\" placeholder=\"password\" value=\"password\" /><input type=\"submit\" value=\"login\" /></form></body></html>'
	} catch( e ){
		template = e;
	}
	return template;
};