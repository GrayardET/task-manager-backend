// routes/employees.js
const express = require("express");
const Employee = require("../models/Employee");
const router = express.Router();

// Create a new employee
router.post("/", async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const newEmployee = new Employee({ name, email, avatar });
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
