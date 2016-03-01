module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'	<main>'
+'		<h1>user details</h1>'
+'		' + include('menu.html') + ''
+'		<ul>'
+'			<li><a href="/users">back to users</a></li>'
+'			<li><a href="/posts/' + vars.first + '">' + vars.first + '\'s posts</a></li>'
+'		</ul>'
+'		<ul>'
+'			<li>first name: <strong>' + vars.first + '</strong></li>'
+'			<li>last name: <strong>' + vars.last + '</strong></li>'
+'			<li>age: <strong>' + vars.age + '</strong></li>'
+'			<li>job: <strong>' + vars.job + '</strong></li>'
+'			<li>_id: <strong>' + vars._id + '</strong></li>'
+'		</ul>'
+'	</main>'
+'' + include('footer.html') + ''
	} catch( e ){
		template = error(e);
	}
	return template;
};