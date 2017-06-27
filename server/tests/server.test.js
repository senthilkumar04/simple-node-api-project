const expect = require('expect');
const request = require('supertest');
var { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Note } = require('../models/note');
const { User } = require('../models/user');
const { notes, populateNotes, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateNotes);

describe("POST /notes", () => {
    it("Should add a new note", (done) => {
        var title = "New Note to be added"
        request(app)
            .post("/notes")
            .send({ title })
            .expect(200)
            .expect((res) => {
                expect(res.body.title).toBeA('string').toBe(title);
            })
            .end(done);
    })
    it("Should not add a new note", (done) => {
        var title = ""
        request(app)
            .post("/notes")
            .send({})
            .expect(400)
            .end(done);
    })
});

describe("GET /notes", () => {
    it("Should get all notes", (done) => {
        request(app)
            .get("/notes")
            .expect(200)
            .expect((res) => {
                expect(res.body.notes.length).toBe(3);
            })
            .end(done);
    })
});

describe("GET /note/:id", () => {
    it("Should return expected note", (done) => {
        request(app)
            .get(`/note/${notes[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.title).toBeA('string').toBe(notes[0].title);
            })
            .end(done);
    })
    it("Should return 400 for non object id", (done) => {
        request(app)
            .get("/note/1234")
            .expect(400)
            .end(done);
    })
    it("Should return 404 id object id is not found", (done) => {
        request(app)
            .get(`/note/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    })
});

describe("DELETE /note/:id", () => {
    it("Should remove expected note", (done) => {
        request(app)
            .delete(`/note/${notes[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.title).toBeA('string').toBe(notes[0].title);
            })
            .end(done);
    })
    it("Should return 400 for non object id", (done) => {
        request(app)
            .delete("/note/1234")
            .expect(400)
            .end(done);
    })
    it("Should return 404 id object id is not found", (done) => {
        request(app)
            .delete(`/note/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    })
});

describe("PATCH /note/:id", () => {
    it("Should update expected note", (done) => {
        var updatedNote = {
            title: "Updated note title",
            description: "Updated desc"
        };
        request(app)
            .patch(`/note/${notes[0]._id.toHexString()}`)
            .send(updatedNote)
            .expect(200)
            .expect((res) => {
                expect(res.body.title).toBeA('string').toBe(updatedNote.title);
            })
            .end(done);
    });
    it("Should return 400 as the request is not correct", (done) => {
        var updatedNote = {
            name: "Updated note title",
            body: "Updated desc"
        };
        request(app)
            .patch(`/note/${notes[0]._id.toHexString()}`)
            .send(updatedNote)
            .expect(400)
            .end(done);
    });
    it("Should return 400 for non object id", (done) => {
        request(app)
            .patch("/note/1234")
            .send({})
            .expect(400)
            .end(done);
    });
    it("Should return 404 if object id is not found", (done) => {
        var updatedNote = {
            title: "Updated note title",
            description: "Updated desc"
        };
        request(app)
            .patch(`/note/${new ObjectID().toHexString()}`)
            .send(updatedNote)
            .expect(404)
            .end(done);
    });
});

describe("GET /users/me", () => {
    it("should return a user authentic", (done) => {
        request(app)
        .get("/users/me")
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body._id).toBe(users[0]._id.toHexString())
            expect(res.body.email).toBe(users[0].email)
        })
        .end(done);
    })
    it("should return a 401 if not authenticated", (done) => {
        request(app)
        .get("/users/me")
        .expect(401)
        .expect((res)=>{
            expect(res.body).toEqual({})
        })
        .end(done);
    })
})

describe("POST /users", () => {
    it("should create a user", (done) => {
        var userData = {
            email : "test@gmail.com",
            password : "passtest"
        }
        request(app)
        .post("/users")
        .send(userData)
        .expect(200)
        .expect((res)=>{
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(userData.email);
        })
        .end(done);
    })
    it("should return valiation error if email is invalid", (done) => {
        var userData = {
            email : "tesjsd",
            password : "passtest"
        };
        request(app)
        .post("/users")
        .send(userData)
        .expect(400)
        .end(done);
    })
    it("should return valiation error if password is invalid", (done) => {
        var userData = {
            email : "sample@gmail.com",
            password : "pass"
        };
        request(app)
        .post("/users")
        .send(userData)
        .expect(400)
        .end(done);
    })
    it("should not create user if email already exists", (done) => {
        var userData = {
            email : users[1].email,
            password : users[1].password
        };
        request(app)
        .post("/users")
        .send(userData)
        .expect(400)
        .end(done);
    })
});

describe("POST /users/login", ()=>{
    it("should login user and return auth token", (done)=>{
        request(app)
        .post("/users/login")
        .send({
            email: users[1].email,
            password : users[1].password
        })
        .expect(200)
        .expect((res)=>{
            expect(res.body.email).toBe(users[1].email);
            expect(res.headers['x-auth']).toExist();
        })
        .end(done);
    })
    it("should reject invalid user", (done)=>{
        request(app)
        .post("/users/login")
        .send({
            email: users[1].email,
            password : "asdf"
        })
        .expect(400)
         .expect((res)=>{
            expect(res.headers['x-auth']).toNotExist();
        })
        .end(done);
    })
})