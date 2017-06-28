const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');
const { Note } = require('./../../models/note');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id : userOneId,
    email : "senthil@eg.com",
    password : "user1pass",
    tokens : [{
        access : 'auth',
        token : jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET)
    }]
}, {
    _id : userTwoId,
    email : "kumar@eg.com",
    password : "user2pass",
    tokens : [{
        access : 'auth',
        token : jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET)
    }]
}]

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
}

const notes = [{
    _id: new ObjectID(),
    title: "Note Test 1",
    _creator : userOneId
}, {
    _id: new ObjectID(),
    title: "Note Test 2",
    _creator : userOneId
}, {
    _id: new ObjectID(),
    title: "Note Test 3",
    _creator : userTwoId
}];

const populateNotes = (done) => {
    Note.remove({}).then(() => {
        return Note.insertMany(notes);
    }).then(() => done());
}


module.exports = { notes, populateNotes, users, populateUsers };