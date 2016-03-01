module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'<main>'
+'	<h1><a href="/projects">projects</a></h1>'
+'	' + include('menu.html') + ''
+'	<ul class="projects projects__collection list-reset">'
+'		<li class="projects__item">' + vars.project.name + '</li>'
+'	</ul>'
+'	<ul class="projects projects__collection list-reset">'
+'		' + (vars.tasks.reduce(function( ret, task, index ){ ret += ''
+'			<li class="projects__item">'
+'				<h3 class="projects__item-heading"><a href="/projects/' + vars.project.url + '/' + task.url + '">' + task.name + '</a></h3>'
+'				<ul>'
+'					<li>' + task.id + '</li>'
+'					<li>' + task.description + '</li>'
+'				</ul>'
+'			</li>'
+'		'; return ret;}, '')) + ''
+'	</ul>'
+'</main>'
+'</body>'
+'</html>'
	} catch( e ){
		template = error(e);
	}
	return template;
};