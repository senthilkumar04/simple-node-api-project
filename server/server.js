var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');

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
    if(ObjectID.isValid(id)){
        Note.findById(id).then((response)=>{
            if(response){
                res.send(response);
            }
            else {
                res.status(404).send();
            }
        }, (error)=>{
            res.status(400).send();
        });
    }
    else {
        res.status(400).send();
    }
});

app.listen(port, () => {
    console.log(`Server is started on port ${port}`);
});

module.exports = { app };