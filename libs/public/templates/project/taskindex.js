module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'<body>'
+'<main>'
+'	<h1><a href="/projects">projects</a></h1>'
+'	' + include('menu.html') + ''
+'	<ul class="projects projects__collection list-reset">'
+'		<li class="projects__item">' + vars.project + ' ' + vars.task + '</li>'
+'	</ul>'
+'</main>'
+'</body>'
+'</html>'
	} catch( e ){
		template = error(e);
	}
	return template;
};