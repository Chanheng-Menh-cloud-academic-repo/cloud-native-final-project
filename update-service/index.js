import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB - Update Service"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Add a health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'update-service' });
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

// Update student by ID
app.put("/update/:id", async (req, res) => {
  try {
    const { Name, Age, Class } = req.body;
    const studentId = req.params.id;

    // Validate input
    if (!Name && !Age && !Class) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    // Prepare update object
    const updateData = {};
    if (Name) updateData.name = Name;
    if (Age) updateData.age = Age;
    if (Class) updateData.class = Class;

    // Find and update the student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      message: "Student updated successfully",
      student: {
        ID: updatedStudent._id,
        Name: updatedStudent.name,
        Age: updatedStudent.age,
        Class: updatedStudent.class,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Error updating student", error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Update Service running on port ${process.env.PORT}`);
});