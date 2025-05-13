import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB - Add Service"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Add a health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'add-service' });
});

const studentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    class: { type: String, required: true },
  },
  { _id: false }
);

const Student = mongoose.model("Student", studentSchema);

// Add single student
app.post('/add', async (req, res) => {
  try {
    const { Name, Age, Class, ID } = req.body;

    const existingStudent = await Student.findById(ID);
    if (existingStudent) {
      return res.status(400).json({
        message: `Student with ID ${ID} already exists.`,
      });
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

// Add multiple students
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
          continue; // Skip failed entry
        }
      }
  
      return res.status(201).json({
        message: `user (A) makes this change${addedCount} student${addedCount !== 1 ? 's' : ''} added successful!${skippedCount > 0 ? ` ${skippedCount} student${skippedCount !== 1 ? 's' : ''} already existed.` : ''}`,
      });
    } catch (err) {
      return res.status(500).json({ message: "Error processing batch add", error: err });
    }
  });
  
app.listen(process.env.PORT, () => {
  console.log(`Add Service running on port ${process.env.PORT}`);
});
