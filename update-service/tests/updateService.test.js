const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

let app, mongod, Student;

beforeAll(async () => {
  // Initialize MongoMemoryServer to simulate MongoDB in memory
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Connect to the in-memory MongoDB without deprecated options
  await mongoose.connect(uri);

  // Define the Student schema
  const studentSchema = new mongoose.Schema(
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      age: { type: Number, required: true },
      class: { type: String, required: true },
    },
    { _id: false }
  );

  // Create the Student model
  Student = mongoose.model('Student', studentSchema);

  // Initialize the express app
  app = express();
  app.use(express.json());

  // Health check route
  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'update-service' });
  });

  // Update student route
  app.put('/update/:id', async (req, res) => {
    try {
      const { Name, Age, Class } = req.body;
      const studentId = req.params.id;

      if (!Name && !Age && !Class) {
        return res.status(400).json({ message: 'No update fields provided' });
      }

      const updateData = {};
      if (Name) updateData.name = Name;
      if (Age) updateData.age = Age;
      if (Class) updateData.class = Class;

      const updatedStudent = await Student.findByIdAndUpdate(studentId, updateData, {
        new: true,
      });

      if (!updatedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }

      return res.status(200).json({
        message: 'Student updated successfully',
        student: {
          ID: updatedStudent._id,
          Name: updatedStudent.name,
          Age: updatedStudent.age,
          Class: updatedStudent.class,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: 'Error updating student', error: err.message });
    }
  });
});

afterAll(async () => {
  // Disconnect from MongoDB and stop MongoMemoryServer after tests are completed
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Update Service API', () => {
  beforeEach(async () => {
    // Clear any previous data and add a new student before each test
    await Student.deleteMany();
    await Student.create({ _id: 'S001', name: 'Alice', age: 20, class: 'A1' });
  });

  it('should respond to health check', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('update-service');
  });

  it('should update an existing student', async () => {
    const res = await request(app)
      .put('/update/S001')
      .send({ Name: 'Alicia', Age: 21 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Student updated successfully');
    expect(res.body.student.Name).toBe('Alicia');
    expect(res.body.student.Age).toBe(21);
  });

  it('should return 404 when updating a non-existent student', async () => {
    const res = await request(app)
      .put('/update/S999')
      .send({ Name: 'Ghost' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Student not found');
  });

  it('should return 400 when no update fields are provided', async () => {
    const res = await request(app).put('/update/S001').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('No update fields provided');
  });
});
