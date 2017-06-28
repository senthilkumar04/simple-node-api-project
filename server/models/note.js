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
    },
    _creator : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = {Note};