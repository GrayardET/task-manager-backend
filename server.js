require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const employeeRoutes = require("./routes/employees");
const ticketRoutes = require("./routes/tickets");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/employees", employeeRoutes);
app.use("/api/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Task Manager API");
});

// root page
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));