var Schema = require( LIB_DIR + 'schema');

function UserSchema(){

	// var Schema = schema( this ).bind( this );

	return {
		id     : Schema.int( 0, 11, _PRIMARY_KEY_ ),                // primary
		level  : Schema.enum( [ 0, 1, 2, 3, 4, 5 ], _NOT_NULL_ ),   // enum
		name   : Schema.obj({                                       // object with getters and setters
			prefix: Schema.string('', 128 ),                        // string with limit of characters
			first : Schema.string(''),                              // string with default of '', no limit
			last  : Schema.string( null )                           // string with default of null
		}),
		dob    : Schema.date( new Date(), null, _REQUIRED_ ),
		email  : Schema.string('', null, _REQUIRED_ ),
		phone  : Schema.obj({
			country : Schema.int( 61, 2 ),
			areaCode: Schema.int( 0, 3 ),
			mobile  : Schema.int( 0, 9 ),
			business: Schema.int( 0, 8 ),
			home    : Schema.int( 0, 8 )
		}),
		address: Schema.obj({
			unit    : Schema.int( 0 ),
			number  : Schema.int( 0 ),
			address : Schema.string(''),
			type    : Schema.string(''),
			state   : Schema.string(''),
			country : Schema.string('Australia'),
			postCode: Schema.int( 0 )
		}),
		social : Schema.obj({
			facebook: Schema.string(''),
			linkedIn: Schema.string(''),
			skype   : Schema.string(''),
			twitter : Schema.string(''),
			github  : Schema.string('')
		})
	};
}

UserSchema.prototype = new Schema;

module.exports = UserSchema;