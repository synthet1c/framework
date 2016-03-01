module.exports = function( error, include, vars ){
	var template;

	try{
		template = ''
+'<!doctype html>'
+'<html lang="en">'
+'<head>'
+'	<meta charset="UTF-8">'
+'	<title>' + vars.product.name + '</title>'
+'</head>'
+'<body>'
+'<h2>' + vars.product.name + '</h2>'
+'<section data-product-id="' + vars.product._id + '">'
+'	<h3>' + vars.product.name + '</h3>'
+'	<section class="product__description">' + vars.product.description + '</section>'
+'	<figure id="product__variants">'
+'		<ul>'
+'		</ul>'
+'	</figure>'
+'	<figure class="product__reviews">'
+'		<ul>'
+'			' + (vars.product.specs.reduce(function( ret, spec, index ){ ret += ''
+'				<li>'
+'					<h5 class="product__spec-title">' + spec.title + '</h5>'
+'					<div class="product__spec-content">' + spec.content + '</div>'
+'				</li>'
+'			'; return ret;}, '')) + ''
+'		</ul>'
+'	</figure>'
+'</section>'
+'</body>'
+'</html>'
	} catch( e ){
		template = error(e);
	}
	return template;
};