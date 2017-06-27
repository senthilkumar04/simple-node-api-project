var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var connectURL = process.env.MONGODB_URI;
mongoose.connect(connectURL);

module.exports = {mongoose};