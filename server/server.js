const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Note } = require('./models/note');
var { User } = require('./models/user');

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/notes', (req, res) => {
    var newNote = new Note({
        title: req.body.title,
        description: req.body.description
    });
    newNote.save().then((response) => {
        res.send(response);
    }, (error) => {
        res.status(400).send(error);
    })
});

app.get('/notes', (req, res) => {
    Note.find().then((response) => {
        res.send({ notes: response });
    }, (error) => {
        res.status(400).send(error);
    })
});

app.get('/note/:id', (req, res) => {
    var id = req.params.id;
    if (ObjectID.isValid(id)) {
        Note.findById(id).then((response) => {
            if (response) {
                res.send(response);
            }
            else {
                res.status(404).send();
            }
        }, (error) => {
            res.status(400).send();
        });
    }
    else {
        res.status(400).send();
    }
});

app.delete('/note/:id', (req, res) => {
    var id = req.params.id;
    if (ObjectID.isValid(id)) {
        Note.findByIdAndRemove(id).then((response) => {
            if (response) {
                res.send(response);
            }
            else {
                res.status(404).send();
            }
        }, (error) => {
            res.status(400).send();
        });
    }
    else {
        res.status(400).send();
    }
});

app.patch('/note/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['title', 'description']);

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }
    if (!(body.title || body.description)) {
        return res.status(400).send();
    }

    Note.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then((note) => {
        if(!note){
            return res.status(404).send();
        }
        res.send(note);
    })
    .catch((error) => {
        return res.status(400).send();
    })
});

app.listen(port, () => {
    console.log(`Server is started on port ${port}`);
});

module.exports = { app };