import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB - Delete Service"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Add a health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'delete-service' });
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

// 1. Delete one student by ID
app.delete("/delete/:id", async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ _id: req.params.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student deleted", student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Delete multiple students by an array of IDs
app.delete("/deletes", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Request must include a non-empty 'ids' array." });
    }

    const result = await Student.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: `${result.deletedCount} student${result.deletedCount !== 1 ? 's' : ''} deleted.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete all students
app.delete("/delete-all", async (req, res) => {
  try {
    const result = await Student.deleteMany({});

    res.status(200).json({
      message: `All students deleted. (${result.deletedCount} student${result.deletedCount !== 1 ? 's' : ''})`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Delete Service running on port ${process.env.PORT}`);
});
