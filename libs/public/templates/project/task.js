module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'<main>'
+'	<h1><a href="/projects">projects</a></h1>'
+'	' + include('menu.html') + ''
+'	<ul class="projects projects__collection list-reset">'
+'		<li class="projects__item">' + vars.task.project.name + ' ' + vars.task.name + '</li>'
+'	</ul>'
+'	<ul class="projects__item-detail">'
+'		<li>project: <strong>' + vars.task.project.name + '</strong></li>'
+'		<li>id: <strong>' + vars.task.id + '</strong></li>'
+'		<li>name: <strong>' + vars.task.name + '</strong></li>'
+'		<li>client: <strong>' + vars.task.project.client + '</strong></li>'
+'		<li>_id: <strong>' + vars.task._id + '</strong></li>'
+'	</ul>'
+'	<p>' + vars.task.description + '</p>'
+'</main>'
+'</body>'
+'</html>'
	} catch( e ){
		template = error(e);
	}
	return template;
};