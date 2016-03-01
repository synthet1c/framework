module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'<h1>posts</h1>'
+'<h3>total time ' + vars.total + '</h3>'
+'' + (vars.products.reduce(function( ret, product, index ){ ret += ''
+'	<section class="product">'
+'		<h3><a href="/products/' + product.link + '">' + product.name + '</a></h3>'
+'		<h4>' + product._id + '</h4>'
+'		<p>price: ' + product.variants[0].price + '</p>'
+'	</section>'
+''; return ret;}, '')) + ''
	} catch( e ){
		template = error(e);
	}
	return template;
};