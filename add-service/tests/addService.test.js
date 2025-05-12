const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

let mongod;
let app;
let Student;

// Recreate the app setup (like your index.js)
beforeAll(async () => {
  // Setup MongoMemoryServer and connect mongoose
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  // Define schema
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

  // Setup Express app
  app = express();
  app.use(express.json());

  // Health check route
  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'add-service' });
  });

  // Add student route
  app.post('/add', async (req, res) => {
    try {
      const { Name, Age, Class, ID } = req.body;
      const existingStudent = await Student.findById(ID);
      if (existingStudent) {
        return res.status(400).json({ message: `Student with ID ${ID} already exists.` });
      }

      const student = new Student({ _id: ID, name: Name, age: Age, class: Class });
      const savedStudent = await student.save();

      return res.status(201).json({
        message: 'Student added',
        student: {
          Name: savedStudent.name,
          Age: savedStudent.age,
          Class: savedStudent.class,
          ID: savedStudent._id,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: 'Error adding student', error: err });
    }
  });

  // Add multiple students route
  app.post('/adds', async (req, res) => {
    try {
      const students = req.body.students;
      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: "Request must include a non-empty 'students' array." });
      }

      let addedCount = 0;
      let skippedCount = 0;

      for (const studentData of students) {
        const { Name, Age, Class, ID } = studentData;
        try {
          const existing = await Student.findById(ID);
          if (existing) {
            skippedCount++;
            continue;
          }

          const newStudent = new Student({
            _id: ID,
            name: Name,
            age: Age,
            class: Class,
          });

          await newStudent.save();
          addedCount++;
        } catch (err) {
          continue;
        }
      }

      return res.status(201).json({
        message: `${addedCount} student${addedCount !== 1 ? 's' : ''} added successful!${skippedCount > 0 ? ` ${skippedCount} student${skippedCount !== 1 ? 's' : ''} already existed.` : ''}`,
      });
    } catch (err) {
      return res.status(500).json({ message: 'Error processing batch add', error: err });
    }
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Add Service API', () => {
  it('should respond to health check', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('add-service');
  });

  it('should add a new student', async () => {
    const res = await request(app).post('/add').send({
      Name: 'John',
      Age: 21,
      Class: 'A1',
      ID: 'S001',
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Student added');
    expect(res.body.student.ID).toBe('S001');
  });

  it('should not add duplicate student', async () => {
    await request(app).post('/add').send({
      Name: 'Jane',
      Age: 22,
      Class: 'B1',
      ID: 'S002',
    });

    const res = await request(app).post('/add').send({
      Name: 'Jane',
      Age: 22,
      Class: 'B1',
      ID: 'S002',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/);
  });

  it('should add multiple students and skip duplicates', async () => {
    await request(app).post('/add').send({
      Name: 'Tom',
      Age: 20,
      Class: 'C1',
      ID: 'S003',
    });

    const res = await request(app).post('/adds').send({
      students: [
        { Name: 'Tom', Age: 20, Class: 'C1', ID: 'S003' }, // duplicate
        { Name: 'Anna', Age: 23, Class: 'C2', ID: 'S004' }, // new
      ],
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/1 student added successful! 1 student already existed/);
  });
});
