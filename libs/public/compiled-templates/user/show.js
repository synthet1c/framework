module.exports = function( vars, fn ){
	var template;

	try{
		template = '<html><head><link rel=\"stylesheet\" href=\"style.css\" /></head><body>' + vars.alert('break stuff') + '<h1>user details</h1><a href=\"/users\">back to users</a><ul><li>first name: <strong>' + vars.first + '</strong></li><li>last name: <strong>' + vars.last + '</strong></li><li>age: <strong>' + vars.age + '</strong></li><li>job: <strong>' + vars.job + '</strong></li><li>_id: <strong>' + vars._id + '</strong></li></ul>' + fn.include('/test-template-fail.html','2016') + '</body></html>'
	} catch( e ){
		template = e;
	}
	return template;
};