/**
 * @package Template
 *
 * the template class is used to store all the information to
 * compile a template. it can be returned as a template string
 * or a json object
 *
 * @author  Andrew Fountain
 * @email   andrew@envision.digital
 * @date    2015-08-01
 */
var
	TemplateFactory = require('./TemplateFactory' ),
	templates = {},
	cache     = 1000 * 1;

module.exports = Template;

/**
 * Template
 *
 * this class is used to hold all the variables used to compile a
 * Template.
 *
 * @param   {Function}  templateFn  function to compile a template
 * @param   {Request}   req         node js server request object
 * @param   {Response}  res         node js server response object
 *
 * @constructor
 */
function Template( templateFn, req, res ){

	this.template   = templateFn;
	this.req        = req;
	this.res        = res;
	this.vars       = {};
}

extend.fluent( Template.prototype, {

	/**
	 * Template.add
	 *
	 * add new variables to the template object
	 *  **function takes a variable amount of arguments**
	 *
	 * @param {Object}  vars    variables to add
	 */
	add: function( vars ){
		if( arguments.length > 1 ){
			var args = Array.prototype.slice.call( arguments, 0 );
			extend.apply(this, args);
		} else {
			extend( this.vars, vars );
		}
	},
	/**
	 * @depreciated no longer necessary
	 * @param req
	 * @param res
	 *
	 * TODO: check if it's necessary to keep the request and response on
	 * the template object
	 */
	init: function( req, res ){
		this.req = req;
		this.res = res;
	},
	/**
	 * Template.send
	 *
	 * this function will compile the template variables with the
	 * template function to give a finished template
	 *
	 * @returns {String}
	 */
	send: function(){
		if( this.res.rewrite ){
			this.res.setHeader('Location', this.res.rewrite.url );
			this.res.statusCode = this.res.rewrite.status;
		}

		if( this.req.mime && this.req.mime === 'json' ){
			this.res.setHeader('content-Type', 'json');
			this.res.statusCode = 200;
			return JSON.stringify( this.vars );
		}

		return this.template( this.vars );
	},
	/**
	 * Template.toJSON
	 *
	 * this function will return the variables stringified
	 */
	toJSON: function(){
		return JSON.stringify( this.vars );
	}
});

// add static methods to the template object
extend.fluent(Template, {
	/**
	 * @static  Template.get
	 *
	 * this function will get a template from the cache or call the
	 * factory to build a new template function
	 *
	 * @param   {String}    name    dot separated string representing file path
	 * @param   {Request}   req     node js server request object
	 * @param   {Response}  res     node js server response object
	 *
	 * @returns {Template}          new Template instance ready to be used
	 */
	get: function( name, req, res ){

		var templateObj = templates[ name ];

		// create or check cache timeout to rebuild the cache
		if( templateObj == null || templateObj.fn && (templateObj.built + cache) < Date.now() ){
			console.log( name + ' template rebuilt');
			templateObj = templates[ name ] = {
				fn: TemplateFactory( name ),
				built: Date.now()
			};
		}

		return new Template( templateObj.fn, req, res );
	}
});

///**
// * @package Template
// *
// * the template class is used to store all the information to
// * compile a template. it can be returned as a template string
// * or a json object
// *
// * @author  Andrew Fountain
// * @email   andrew@envision.digital
// * @date    2015-08-01
// */
//var
//	TemplateFactory = require('./TemplateFactory'),
//	templates = {},
//	cache     = 1000 * 1;
//
//module.exports = Template;

///**
// * Template
// *
// * this class is used to hold all the variables used to compile a
// * Template.
// *
// * @param   {Function}  templateFn  function to compile a template
// * @param   {Request}   req         node js server request object
// * @param   {Response}  res         node js server response object
// *
// * @constructor
// */
//function Template( templateFn, req, res ){
//
//	this.template   = templateFn;
//	this.req        = req;
//	this.res        = res;
//	this.vars       = {};
//}
//
//extend.fluent( Template.prototype, {
//
//	/**
//	 * Template.add
//	 *
//	 * add new variables to the template object
//	 *  **function takes a variable amount of arguments**
//	 *
//	 * @param {Object}  vars    variables to add
//	 */
//	add: function( vars ){
//		if( arguments.length > 1 ){
//			var args = Array.prototype.slice.call( arguments, 0 );
//			extend.apply(this, args);
//		} else {
//			extend( this.vars, vars );
//		}
//	},
//	/**
//	 * @depreciated no longer necessary
//	 * @param req
//	 * @param res
//	 *
//	 * TODO: check if it's necessary to keep the request and response on
//	 * the template object
//	 */
//	init: function( req, res ){
//		this.req = req;
//		this.res = res;
//	},
//	/**
//	 * Template.send
//	 *
//	 * this function will compile the template variables with the
//	 * template function to give a finished template
//	 *
//	 * @returns {String}
//	 */
//	send: function(){
//		if( this.res.rewrite ){
//			this.res.setHeader('Location', this.res.rewrite.url );
//			this.res.statusCode = this.res.rewrite.status;
//		}
//
//		if( this.req.mime && this.req.mime === 'json' ){
//			this.res.setHeader('content-Type', 'json');
//			this.res.statusCode = 200;
//			return JSON.stringify( this.vars );
//		}
//
//		return this.template( this.vars );
//	},
//	/**
//	 * Template.toJSON
//	 *
//	 * this function will return the variables stringified
//	 */
//	toJSON: function(){
//		return JSON.stringify( this.vars );
//	}
//});
//
//// add static methods to the template object
//extend.fluent(Template, {
//	/**
//	 * @static  Template.get
//	 *
//	 * this function will get a template from the cache or call the
//	 * factory to build a new template function
//	 *
//	 * @param   {String}    name    dot separated string representing file path
//	 * @param   {Request}   req     node js server request object
//	 * @param   {Response}  res     node js server response object
//	 *
//	 * @returns {Template}          new Template instance ready to be used
//	 */
//	get: function( name, req, res ){
//
//		var templateObj = templates[ name ];
//
//		// create or check cache timeout to rebuild the cache
//		if( templateObj == null || templateObj.fn && (templateObj.built + cache) < Date.now() ){
//			console.log( name + ' template rebuilt');
//			templateObj = templates[ name ] = {
//				fn: TemplateFactory( name ),
//				built: Date.now()
//			};
//		}
//
//		return new Template( templateObj.fn, req, res );
//	}
//});

///**
// * @package Template
// *
// * the template class is used to store all the information to
// * compile a template. it can be returned as a template string
// * or a json object
// *
// * @author  Andrew Fountain
// * @email   andrew@envision.digital
// * @date    2015-08-01
// */
//const
//	TemplateFactory = require('./TemplateFactory');
//
//module.exports = Template;
//
//var
//	templates = {},
//    cache = 1000 * 1;
//
///**
// * Template
// *
// * this class is used to hold all the variables used to compile a
// * Template.
// *
// * @param   {Function}  templateFn  function to compile a template
// * @param   {Request}   req         node js server request object
// * @param   {Response}  res         node js server response object
// *
// * @constructor
// */
//function Template( templateFn, req, res ){
//
//	this.template   = templateFn;
//	this.req        = req;
//	this.res        = res;
//	this.vars       = {};
//}
//
//extend.fluent( Template.prototype, {
//
//	/**
//	 * Template.add
//	 *
//	 * add new variables to the template object
//	 *  **function takes a variable amount of arguments**
//	 *
//	 * @param {Object}  vars    variables to add
//	 */
//	add: function( vars ){
//		if( arguments.length > 1 ){
//			var args = Array.prototype.slice.call( arguments, 0 );
//			extend.apply(this, args);
//		} else {
//			extend( this.vars, vars );
//		}
//	},
//	/**
//	 * @depreciated no longer necessary
//	 * @param req
//	 * @param res
//	 *
//	 * TODO: check if it's necessary to keep the request and response on
//	 * the template object
//	 */
//	init: function( req, res ){
//		this.req = req;
//		this.res = res;
//	},
//	/**
//	 * Template.send
//	 *
//	 * this function will compile the template variables with the
//	 * template function to give a finished template
//	 *
//	 * @returns {String}
//	 */
//	send: function(){
//		if( this.res.rewrite ){
//			this.res.setHeader('Location', this.res.rewrite.url );
//			this.res.statusCode = this.res.rewrite.status;
//		}
//
//		if( this.req.mime && this.req.mime === 'json' ){
//			this.res.setHeader('content-Type', 'json');
//			this.res.statusCode = 200;
//			return JSON.stringify( this.vars );
//		}
//
//		return this.template( this.vars );
//	},
//	/**
//	 * Template.toJSON
//	 *
//	 * this function will return the variables stringified
//	 */
//	toJSON: function(){
//		return JSON.stringify( this.vars );
//	}
//});
//
//// add static methods to the template object
//extend.fluent(Template, {
//	/**
//	 * @static  Template.get
//	 *
//	 * this function will get a template from the cache or call the
//	 * factory to build a new template function
//	 *
//	 * @param   {String}    name    dot separated string representing file path
//	 * @param   {Request}   req     node js server request object
//	 * @param   {Response}  res     node js server response object
//	 *
//	 * @returns {Template}          new Template instance ready to be used
//	 */
//	get: function( name, req, res ){
//
//		var templateObj = templates[ name ];
//
//		// create or check cache timeout to rebuild the cache
//		if( templateObj == null || templateObj.fn && (templateObj.built + cache) < Date.now() ){
//			console.log( name + ' template rebuilt');
//			templateObj = templates[ name ] = {
//				fn: TemplateFactory( name ),
//				built: Date.now()
//			};
//		}
//
//		return new Template( templateObj.fn, req, res );
//	}
//});