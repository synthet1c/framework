module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'<main>'
+'	<h1><a href="/projects">projects</a></h1>'
+'		' + include('menu.html') + ''
+'	<p><a href="/project/create">create new project</a></p>'
+'	<p><a href="/login">login</a></p>'
+'	<form action="/login" method="POST">'
+'		<input type="hidden" name="method" value="DELETE">'
+'		<input type="hidden" name="token" value="andrew">'
+'		<input type="submit" value="logout">'
+'	</form>'
+'	<form action="/project" method="POST">'
+'		<input type="hidden" name="method" value="DELETE"/>'
+'		<ul class="projects projects__collection list-reset">'
+'			' + (vars.projects.reduce(function( ret, project, index ){ ret += ''
+'				<li class="projects__item" data-id="' + project._id + '">'
+'					<h3 class="projects__item-heading"><a href="project/' + project.url + '">' + project.name + '</a>'
+'						<input type="submit" name="destroy" style="float:right" value="' + project._id + '" /></h3>'
+'					<ul class="projects__item-detail">'
+'						<li>joxTaskNo: <strong>' + project.jobTaskNo + '</strong></li>'
+'						<li>code: <strong>' + project.code + '</strong></li>'
+'						<li>client: <strong>' + project.client + '</strong></li>'
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