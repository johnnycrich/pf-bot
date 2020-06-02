const mongoose = require('mongoose');

const {
	Schema,
} = mongoose;

const dogSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	pending: {
		type: Boolean,
	},
	dateAdded: {
		type: Date,
	},
	dateModified: {
		type: Date,
	}
});

/**
 * Registration
 */
module.exports = mongoose.model('Dog', dogSchema);