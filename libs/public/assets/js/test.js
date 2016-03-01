var
	smart = {
		'class': 'smart',
		one: 'one',
		two: 'two',
		three: 'three',
		foo: 'foo',
		bar: 'bar',
		baz: 'baz',
		heading: 'smart template',
		content: 'smart content injected into the function rather than through string replacement'
	},
	dumb  = {
		'class': 'template',
		one  : 'one',
		two  : 'two',
		three: 'three',
		foo  : 'foo',
		bar  : 'bar',
		baz  : 'baz',
		heading: 'dumb template',
		content: 'dumb content that is replaced using regex'
	};

function smartTemplate( vars ){
	return "<div class=\"" + vars.class + "\"><h3>" + vars.heading + "</h3>" + vars.content + " <span>" + vars.one + "</span> <span>" + vars.two + "</span> <span>" + vars.three + "</span> <span>" + vars.foo + "</span> <span>" + vars.bar + "</span> <span>" + vars.baz + "</span></div>";
}

function generateTemplate( template ){
	template = template.replace(/\$(\w+)/gm, "' + vars.$1 + '");
	return new Function("vars", "return '" + template + "';");
}

var template = "<div class=\"$class\"><h3>$heading</h3>$content <span>$one</span> <span>$two</span> <span>$three</span> <span>$foo</span> <span>$bar</span> <span>$baz</span> </div>";
var SmartTemplate = generateTemplate( template );

function dumbTemplate( vars ){

	return Object.keys( dumb ).reduce( function( template, key ){
		return template.replace( new RegExp( "\\$" + key, 'gim' ), vars[ key ] );
	}, template );
}

var startSmart = new Date().getTime();
for( var ii = 0; ii < 4000; ii++ ) {
	document.write( SmartTemplate( smart ) );
}
console.log( 'smart', new Date().getTime() - startSmart );

var startDumb = new Date().getTime();
for( var ii = 0; ii < 4000; ii++ ) {
	document.write( dumbTemplate( dumb ) );
}
console.log( 'dumb', new Date().getTime() - startDumb );