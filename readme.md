# another fricken framework

This framework is based loosely on the api of laravel, trying to replicate the routing, models, controllers and templates using node and mongodb for storage. Any large running processes like dealing with large arrays is delegated to a separate web workers so node will be able to manage a high number of users without breaking a sweat.

# Routing
package: `Request`
Routing for the application uses regular expression pattern matching allowing you to specify your own url patters and the controllers that handle the request.

## Basic routing
Routes are defined in `app.js`. They allow you to define the way the framework processes your request and delegate the functionality to a controller or to a method of a controller.

### route methods
```js
Request.get( controller, urlpattern );
Request.post( controller, urlpattern );
Request.put( controller, urlpattern );
Request.patch( controller, urlpattern );
Request.delete( controller, urlpattern );
```

### pattern matching
when specifying your route you can tell the framework that you intend to pull a value from the url and use it in your request.
To do so you simply need to prepend the url slug with a colon eg `':capture'`.
If you need to fire a different callback for a different type you can specify it before the colon eg. `'string:capture'` you can use `string|int` when declaring the type.
```js
Request.get('/user/:id', function( id ){
  // do something with the id
});
```

### multiple routes
You can specify multiple routes at the same time with the `routes` method. You need to provide an array of routes that target methods on the controller.
`Request.routes( namespace: string, controller: String, routes: Array )`
```js
Request.routes('user', 'UserController', [
  ['GET', 'index', ''],
  ['GET', 'show', '/:id'],
  ['POST', 'store', '/:id'],
  [...]
]);
```
| param | type | example | description
| namespace | String |`'user'` | using a namespace will wrap the routes under a common parent |
| controller | String | `'UserController'` | a string identifier of the controller that will handle the request |
| routes | Array | `[['request method', 'controller method', 'url pattern']]`| a multidimensional array that holds the routes |

### restful
this method will create all the standard restful routes, get, post, put, patch, delete, and allow you to add additional routes using a *routes* array
`Request.restful( namespace: string, controller: String, routes: Array )`

# Models
the framework uses on ORM to manage relationships between data object so you don't ever need to touch mongo if you don't need anything more complicated that most standard queries, but you can get deep into mongo if you need to.

## Defining new models
To make creating models that inherit from the Model class the `elegant` factory has been created to streamline the process, while giving you access to extend your models with any desired behavior you require.

```js
var MyClass = elegant( constructor, instance, methods, errorHandlers );
```

```js
var MyClass = elegant(
  function MyClass(){
    this.__proto__.constructor.call( this );
  },
  function myclass(){},
  {
    relation: elegant.hasOne('Relation')
  },
  {
    set: function setErrorHandler( err ) { ... }
    get: function getErrorHandler( err ) { ... }
  }
);
```

### elegant
`./lib/models.js`;
```js
elegant.hasMany( model, foreign, primary );
elegant.hasOne( model, foreign, primary );
elegant.belongsTo( model, foreign, primary );
```

Extending the `Model` class through `elegant` will make your class inherit all of it's functionality.

```js
Model.find( id );
Model.all();
Model.exists( key );
Model.missing( key );
Model.between( key, min, max );
Model.larger( key, value );
Model.where( query );
Model.limit( max );
Model.skip( count );
Model.not( ...columns )
Model.get( ...columns );
Model.attach( obj );
Model.save();


// the following methods will tell the framework that your query is
// finished being built and it's time to get the data from mongo
Model.success( callback );
Model.toArray( callback );
Model.toObject( callback );
Model.toCursor( callback );
Model.toStream( callback );
Model.toInstance( callback );

// perform an action on the database but don't wait for a response
Model.exec();
```

# methods
Methods on the model modify the underlying query object that get's passed to the mongo instance.

By default models are fluent, so all query parameters can be chained to mutate the query object in a predictable way.

## query parameters

### find
retrieve a document from a collection by the id provided.

### all
retrieve all documents from a collection in mongo

### exists
include documents from a collection where `key` exits in the document

### missing
include documents from a collection where `key` does not exist in the document

### between
include documents from a collection where a `key` is between the `min` and `max` values

### larger
include documents from a collection where `key` as a value larger than `max`

### where
include documents where `query` passes. `query` can be any mongo query

### limit
Limit will stop the mongo collection results from being larger than `max`

### skip
Skip is used in pagination to allow you to seperate large result sets into smaller more manageable ones.

## result parameters

### get
get will whitelist the parameters that will be returned

### not
not will blacklist the fields that are returned

## relationship modifiers

### attach
attach will look to the model for a relationship, asynchronously perform the query and attach the result to the current response.

## update modifiers

### save
save will tell the framework that the model it's called on should save it's internal state to mongo

## response processors

### success
Success will fire the mongo query and on success it will return an array of results
```js
Model.success(( results ) => {
  results.map( ( result ) => { ... } );
});
```

##### example
find `10` users whose age is greater than `31` but skip the first 5 results
```js
User
  .larger('age', 31)
  .not('password')
  .limit(10)
  .skip(5)
  .success(function( result ){
    // do something with the result
  });
```

as well as using the native methods you can invoke joins between data structures that you have declared when you constructed your Model class

find all `'posts'` by the user with an id of `1`
```js
User
  .find(1)
  .posts()
  .toArray(function( result ){
    // do something with the users posts
  });
```

find the user with id of `1` and attach all their `'posts'` to the response
```js
User
  .find(1)
  .attach('posts')
  .toInstance(function( result ){
    // do something with the users posts
  });
```

# controllers

constrollers are used to handle the functionality for a route. They have automatic dependancy injection if you specify more than the required arguments.

The following are the standard restful methods that will be called if you use the `Request.restful` method to create your routes

```js
{
  index: function( req, res, Template, injectModules... ) {
    return function(){ ... }
  },
  create: function( req, res, Template, injectModules... ) {
    return function(){ ... }
  },
  show: function( req, res, Template, injectModules... ) {
    return function( id ){ ... }
  },
  store: function( req, res, injectModules... ) {
    return function( params ){ ... }
  },
  edit: function( req, res, Template, injectModules... ) {
    return function( id ){ ... }
  },
  update: function( req, res, Template, injectModules... ) {
    return function( id ){ ... }
  },
  destroy: function( req, res, injectModules... ) {
    return function( id ){ ... }
  }
}
```

# templates
The framework also includes a templating engine that has a twist. Once a template is parsed it's just transformed into a callable pure function. It's no react virtual dom, but it's pretty cool and very efficient for creating dynamic templates as compared to using just regex to replace placeholders in the template like mustache.

Template creation timestamps are also checked to see if the html template has changed since the last compile while the framework is in developer mode. If the file has changed the template function will be rebuilt ready for use.

The templating language is very basic, providing only variable replacement and forEach loops to allow printing collections of data. You can even run any javascript function in scope on the template variables.

```html
{{include file='something.html'}}
<ul class="{{variable}}">
  {{foreach things as thing}}
    <li>
      <span>{{someFunction(thing.variable)}}</span>
    </li>
  {{/foreach}}
</ul>
```

## filenames
the filenames with the routes are dependent on being called the same thing as their controller method.

## folder structure for templates
```
- public
-- templates
-- {{ module }}
--- index
--- show
--- list
--- create
--- edit
```
