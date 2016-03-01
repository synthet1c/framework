var Schema = require( LIB_DIR + 'schema' );

function ProjectSchema(){

	return {
		id     : Schema.int( 0, 11, _PRIMARY_KEY_ ),                // primary
		name: Schema.string('', null, _REQUIRED_),
		code: Schema.string('', null, _REQUIRED_),
		jobTaskNo: Schema.number(),
		jobNo: Schema.int(null, 4),
		client: Schema.int('', 4)
	};
}

ProjectSchema.prototype = new Schema;

module.exports = ProjectSchema;