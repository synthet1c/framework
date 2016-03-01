module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'<main>'
+'	<h1><a href="/projects">' + vars.task.name + ' edit</a></h1>'
+'	' + include('menu.html') + ''
+'	<form class="user__create" action="/projects/' + vars.project.url + '/task/create" method="POST">'
+'		<input type="hidden" name="method" value="PATCH" />'
+'		<input type="hidden" name="token" value="' + vars.token + '">'
+'		<div class="form-group">'
+'			<label for="name">name</label>'
+'			<input type="text" name="name" placeholder="name" value="' + vars.task.name + '" />'
+'		</div>'
+'		<div class="form-group">'
+'			<label for="id">id</label>'
+'			<input type="text" name="id" placeholder="id" value="' + vars.task.id + '" />'
+'		</div>'
+'		<div class="form-group">'
+'			<label for="description">description</label>'
+'			<input type="text" name="description" placeholder="description" value="' + vars.task.description + '" />'
+'		</div>'
+'		<div class="form-group">'
+'			<label for="project">project</label>'
+'			<input type="text" name="project" placeholder="project" value="' + vars.project.code + '" />'
+'		</div>'
+'		<input type="submit" value="update task" />'
+'	</form>'
+'</main>'
+'' + include('footer.html') + ''
	} catch( e ){
		template = error(e);
	}
	return template;
};