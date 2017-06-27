var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var connectURL = process.env.MONGODB_URI || "mongodb://localhost:27017/NotesApp";
mongoose.connect(connectURL);

module.exports = {mongoose};