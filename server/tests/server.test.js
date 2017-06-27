const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Note} = require('../models/note');
const {User} = require('../models/user');

const notes = [{
    _id : new ObjectID(),
    title : "Note Test 1"
},{
    _id : new ObjectID(),
    title : "Note Test 2"
},{
    _id : new ObjectID(),
    title : "Note Test 3"
}];

beforeEach((done) => {
    Note.remove({}).then(() => {
        return Note.insertMany(notes);
    }).then(()=> done());
})

describe("POST /notes", () => {
    it("Should add a new note", (done) => {
        var title = "New Note to be added"
        request(app)
        .post("/notes")
        .send({title})
        .expect(200)
        .expect((res)=>{
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
        .expect((res)=>{
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
        .expect((res)=>{
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
        .expect((res)=>{
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
            title : "Updated note title",
            description : "Updated desc"
        };
        request(app)
        .patch(`/note/${notes[0]._id.toHexString()}`)
        .send(updatedNote)
        .expect(200)
        .expect((res)=>{
            expect(res.body.title).toBeA('string').toBe(updatedNote.title);
        })
        .end(done);
    });
    it("Should return 400 as the request is not correct", (done) => {
        var updatedNote = {
            name : "Updated note title",
            body : "Updated desc"
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
            title : "Updated note title",
            description : "Updated desc"
        };
        request(app)
        .patch(`/note/${new ObjectID().toHexString()}`)
        .send(updatedNote)
        .expect(404)
        .end(done);
    });
});