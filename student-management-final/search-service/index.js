import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB - Search Service"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Add a health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'search-service' });
});

// Use custom _id as student ID
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

// ✅ Search by custom ID
app.get("/search/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all students
app.get("/search-all", async (req, res) => {
  try {
    const students = await Student.find();
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found in the database." });
    }

    res.status(200).json({
      count: students.length,
      students: students,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(process.env.PORT, () => {
  console.log(`Search Service running on port ${process.env.PORT}`);
});
