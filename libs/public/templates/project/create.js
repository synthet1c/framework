module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'' + include('menu.html') + ''
+'<main>'
+'	<h1>Create a new Project</h1>'
+'	<form class="user__create" action="/projects" method="POST">'
+'		<input type="hidden" name="method" value="PUT" />'
+'		<input type="hidden" name="token" value="' + vars.token + '">'
+'		<div class="form-group">'
+'			<label for="name">name</label>'
+'			<input type="text" name="name" placeholder="name" value="some project" />'
+'		</div>'
+'		<div class="form-group">'
+'			<label for="code">code</label>'
+'			<input type="text" name="code" placeholder="code" value="SP_001" />'
+'		</div>'
+'		<div class="form-group">'
+'			<label for="jobTaskNo">jobTaskNo</label>'
+'			<input type="text" name="jobTaskNo" placeholder="jobTaskNo" value="1001" />'
+'		</div>'
+'		<div class="form-group">'
+'			<label for="client">client</label>'
+'			<select name="client" id="client">'
+'				' + (vars.users.reduce(function( ret, user, index ){ ret += ''
+'					<option value="' + user._id + '">' + user.first + ' ' + user.last + '</option>'
+'				'; return ret;}, '')) + ''
+'			</select>'
+'			<input type="text" name="client" placeholder="client" value="" />'
+'		</div>'
+'		<input type="submit" value="create project" />'
+'	</form>'
+'</main>'
+'' + include('footer.html') + ''
	} catch( e ){
		template = error(e);
	}
	return template;
};