module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'<main>'
+'	<h1>login</h1>'
+'	' + include('menu.html') + ''
+'	<form class="user__login" action="/login" method="POST">'
+'		<div class="form-group">'
+'			<label for="">username</label>'
+'			<input type="text" name="user" placeholder="username" value="' + vars.user + '" />'
+'		</div>'
+'		<div class="form-group">'
+'			<label for="">password</label>'
+'			<input type="text" name="password" placeholder="password" value="password" />'
+'		</div>'
+'		<input type="submit" value="login" />'
+'	</form>'
+'</main>'
+'' + include('footer.html') + ''
	} catch( e ){
		template = error(e);
	}
	return template;
};