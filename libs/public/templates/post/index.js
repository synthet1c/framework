module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'' + include('header.html') + ''
+'	<main>'
+'		<h1>posts</h1>'
+'		' + include('menu.html') + ''
+'		<h3>total time ' + vars.total + '</h3>'
+'		' + (vars.posts.reduce(function( ret, post, index ){ ret += ''
+'			<section class="post" data-id="' + post._id + '">'
+'				<header>'
+'					<a href="#" class="post__new"></a>'
+'					<a href="/user/' + post.author.first + '">' + post.author.first + ' ' + post.author.last + '</a>'
+'					<ul class="post__author-social">'
+'						<li><a class="icon-plus" href="http://www.facebook.com/' + post.author.first + '"></a></li>'
+'						<li><a class="icon-facebook" href="http://www.facebook.com/' + post.author.first + '"></a></li>'
+'						<li><a class="icon-twitter" href="http://www.twitter.com/' + post.author.first + '"></a></li>'
+'					</ul>'
+'				</header>'
+'				<p>' + post.post + '</p>'
+'			</section>'
+'		'; return ret;}, '')) + ''
+'	</main>'
+'' + include('footer.html') + ''
	} catch( e ){
		template = error(e);
	}
	return template;
};