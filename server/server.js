require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Note } = require('./models/note');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();
var port = process.env.PORT;

app.use(bodyParser.json());

app.post('/notes', authenticate, (req, res) => {
    var newNote = new Note({
        title: req.body.title,
        description: req.body.description,
        _creator: req.user._id
    });
    newNote.save().then((response) => {
        res.send(response);
    }, (error) => {
        res.status(400).send(error);
    })
});

app.get('/notes', authenticate, (req, res) => {
    Note.find({
        _creator : req.user._id
    }).then((response) => {
        res.send({ notes: response });
    }, (error) => {
        res.status(400).send(error);
    })
});

app.get('/note/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (ObjectID.isValid(id)) {
        Note.findOne({
            _id: id,
            _creator : req.user._id
        }).then((response) => {
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

app.delete('/note/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (ObjectID.isValid(id)) {
        Note.findOneAndRemove({
            _id : id,
            _creator : req.user._id
        }).then((response) => {
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

app.patch('/note/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['title', 'description']);

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }
    if (!(body.title || body.description)) {
        return res.status(400).send();
    }

    Note.findOneAndUpdate({
        _id: id,
        _creator : req.user._id
    }, { $set: body }, { new: true })
        .then((note) => {
            if (!note) {
                return res.status(404).send();
            }
            res.send(note);
        })
        .catch((error) => {
            return res.status(400).send();
        })
});

app.post("/users", (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var newUser = new User(body);
    newUser.save().then(() => {
        return newUser.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(newUser);
    }).catch((error) => {
        res.status(400).send(error);
    })
})

app.get("/users/me", authenticate, (req, res) => {
    res.send(req.user);
});

app.post("/users/login", (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user) => {
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
})

app.delete("/users/me/token", authenticate, (req, res)=>{
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    }).catch((e)=>{
        res.status(400).send();
    });
})

app.listen(port, () => {
    console.log(`Server is started on port ${port}`);
});

module.exports = { app };