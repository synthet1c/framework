module.exports = function( vars, fn ){
	var template;

	try{
		template = '<h1>posts</h1><h3>total time ' + vars.total + '</h3>' + (vars.posts.reduce(function( str, post ){ return str += '<section class="post"><h3>' + post._id + '</h3><h4>' + post.author.first + '</h4><p>' + post.post + '</p></section>' }, '')) + ''
	} catch( e ){
		template = e;
	}
	return template;
};