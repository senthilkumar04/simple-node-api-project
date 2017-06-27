var mongoose = require('mongoose');

var Note = mongoose.model('Note', {
    title: {
        type: String,
        required: true,
        minlength: 5,
        trim: true
    },
    description: {
        type: String,
        default: 'Note description goes here'
    }
});

module.exports = {Note};