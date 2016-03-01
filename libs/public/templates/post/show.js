module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'<main>'
+'	<h1>User Posts</h1>'
+'	' + include('menu.html') + ''
+'	' + (vars.posts.reduce(function( ret, post, index ){ ret += ''
+'		<section class="post" data-post-id="' + post._id + '">'
+'			<h4>' + post.author.first + ' ' + post.author.last + '</h4>'
+'			<h5>' + post.author.job + '</h5>'
+'			<p>' + post.post + '</p>'
+'		</section>'
+'	'; return ret;}, '')) + ''
+'</main>'
+'' + include('footer.html') + ''
	} catch( e ){
		template = error(e);
	}
	return template;
};