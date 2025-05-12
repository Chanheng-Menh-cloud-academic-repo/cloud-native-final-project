const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

let mongod;
let app;
let Student;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);

  const studentSchema = new mongoose.Schema(
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      age: { type: Number, required: true },
      class: { type: String, required: true },
    },
    { _id: false }
  );
  Student = mongoose.model('Student', studentSchema);

  app = express();
  app.use(express.json());

  // Routes
  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'search-service' });
  });

  app.get('/search/:id', async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).json({ message: 'Student not found' });
      res.json(student);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/search-all', async (req, res) => {
    try {
      const students = await Student.find();
      if (students.length === 0) {
        return res.status(404).json({ message: 'No students found in the database.' });
      }
      res.status(200).json({ count: students.length, students });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Search Service API', () => {
  it('should respond to health check', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('search-service');
  });

  it('should return 404 when no students exist in database', async () => {
    const res = await request(app).get('/search-all');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('No students found in the database.');
  });

  it('should add and find a student by ID', async () => {
    const student = new Student({ _id: 'S001', name: 'John', age: 20, class: 'A1' });
    await student.save();

    const res = await request(app).get('/search/S001');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('John');
    expect(res.body.age).toBe(20);
    expect(res.body.class).toBe('A1');
  });

  it('should return 404 if student not found', async () => {
    const res = await request(app).get('/search/S999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Student not found');
  });

  it('should return all students when present', async () => {
    await Student.create([
      { _id: 'S002', name: 'Jane', age: 21, class: 'B1' },
      { _id: 'S003', name: 'Tom', age: 22, class: 'C1' },
    ]);

    const res = await request(app).get('/search-all');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
    expect(res.body.students.some(s => s._id === 'S002')).toBeTruthy();
  });
});
