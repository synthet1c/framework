module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'<main>'
+'	<h1><a href="/users">users</a></h1>'
+'		' + include('menu.html') + ''
+'	<p><a href="/user/create">create new user</a></p>'
+'	<p><a href="/login">login</a></p>'
+'	<form action="/login" method="POST">'
+'		<input type="hidden" name="method" value="DELETE">'
+'		<input type="hidden" name="token" value="andrew">'
+'		<input type="submit" value="logout">'
+'	</form>'
+'	<form action="/user" method="POST">'
+'		<input type="hidden" name="method" value="DELETE"/>'
+'		<ul class="users users__collection list-reset">'
+'			' + (vars.users.reduce(function( ret, user, index ){ ret += ''
+'				<li class="users__item" data-id="' + user._id + '">'
+'					<h3 class="users__item-heading"><a href="user/' + user.first + '">' + user.first + '</a>'
+'						<input type="submit" name="destroy" style="float:right" value="' + user._id + '" /></h3>'
+'					<ul class="users__item-detail">'
+'						<li>job: <strong>' + user.job + '</strong></li>'
+'						<li>age: <strong>' + user.age + '</strong></li>'
+'						<li>index: <strong>' + index + '</strong></li>'
+'					</ul>'
+'				</li>'
+'			'; return ret;}, '')) + ''
+'		</ul>'
+'	</form>'
+'</main>'
+'' + include('footer.html') + ''
	} catch( e ){
		template = error(e);
	}
	return template;
};