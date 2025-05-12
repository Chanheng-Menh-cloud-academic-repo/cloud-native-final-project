// deleteService.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

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

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'delete-service' });
  });

  app.delete('/delete/:id', async (req, res) => {
    const studentId = req.params.id;
    try {
      const deletedStudent = await Student.findByIdAndDelete(studentId);
      if (!deletedStudent) {
        return res.status(404).json({ message: `Student with ID ${studentId} not found.` });
      }
      return res.status(200).json({ message: `Student with ID ${studentId} deleted.` });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting student', error });
    }
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Delete Service API', () => {
  beforeEach(async () => {
    await Student.create({
      _id: 'S001',
      name: 'John',
      age: 21,
      class: 'A1',
    });
  });

  afterEach(async () => {
    await Student.deleteMany({});
  });

  it('should respond to health check', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('delete-service');
  });

  it('should delete an existing student', async () => {
    const res = await request(app).delete('/delete/S001');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Student with ID S001 deleted.');
  });

  it('should return 404 for non-existent student', async () => {
    const res = await request(app).delete('/delete/S999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Student with ID S999 not found.');
  });
});
