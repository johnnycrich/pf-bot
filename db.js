/**
 * @author Johnny Richardson
 * Database connnection
 * ==========
 */
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const url = 'mongodb://localhost/grdne';
module.exports = () => {
	try {
		const conn = mongoose.createConnection(url, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		mongoose.set('useCreateIndex', true);
		return conn;

	} catch (e) {
		global.logger.error(e);
		throw new Error(e);
	}
};