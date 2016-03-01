module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'<main>'
+'	<h1><a href="/projects/' + vars.project.url + '">' + vars.project.name + '</a></h1>'
+'	' + include('menu.html') + ''
+'	<ul>'
+'		<li><a href="/projects">back to projects</a></li>'
+'	</ul>'
+'	<ul class="">'
+'		<li class="">' + vars.project.name + '</li>'
+'		<li class="">jobTaskNo: <strong>' + vars.project.jobTaskNo + '</strong></li>'
+'		<li class="">code: <strong>' + vars.project.code + '</strong></li>'
+'		<li class="">client: <strong>' + vars.project.client + '</strong></li>'
+'	</ul>'
+'	<ul class="projects projects__collection list-reset">'
+'		' + (vars.project.tasks.reduce(function( ret, task, index ){ ret += ''
+'		<li class="projects__item">'
+'			<h3 class="projects__item-heading"><a href="/projects/' + vars.project.url + '/' + task.url + '">' + task.name + '</a></h3>'
+'			<ul>'
+'				<li>' + task.id + '</li>'
+'				<li>' + task.description + '</li>'
+'			</ul>'
+'		</li>'
+'		'; return ret;}, '')) + ''
+'	</ul>'
+'</main>'
+'' + include('footer.html') + ''
	} catch( e ){
		template = error(e);
	}
	return template;
};