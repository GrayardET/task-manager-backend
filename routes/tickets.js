const mongoose = require("mongoose");
const express = require("express");
const Ticket = require("../models/Ticket");
const Employee = require("../models/Employee"); // Import the Employee model
const router = express.Router();

// Create a new ticket
router.post("/", async (req, res) => {
  try {
    console.log(req.body);
    const {
      ticketNumber,
      ticketName,
      description,
      assignedTo,
      comments,
      subtickets,
      author,
      status,
      type,
    } = req.body;

    console.log("got here 0");
    const assignedToObjectIds = assignedTo.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    console.log("got here 1");
    const foundEmployees = await Employee.find({
      _id: { $in: assignedToObjectIds },
    });

    console.log("got here 2");
    // Check if all employee IDs exist in the database
    if (foundEmployees.length !== assignedToObjectIds.length) {
      return res
        .status(400)
        .json({ message: "One or more assigned employees do not exist." });
    }

    const newTicket = new Ticket({
      ticketNumber,
      ticketName,
      description,
      assignedTo,
      comments,
      author,
      subtickets,
      status,
      type,
    });

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// bulk ticket creation
router.post("/bulk", async (req, res) => {
  try {
    const tickets = req.body.tickets;
    const newTickets = await Ticket.insertMany(tickets);
    res.status(201).json(newTickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("assignedTo")
      .populate("comments.employee")
      .populate("subtickets")
      .populate("author");

    res.status(200).json(tickets || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:ticketId", async (req, res) => {
  const { ticketId } = req.params;

  try {
    const cleanTicketId = ticketId.trim();

    // Check if the ticketId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(cleanTicketId)) {
      return res.status(400).json({ message: "Invalid ticket ID format" });
    }

    const objectId = new mongoose.Types.ObjectId(cleanTicketId);

    // Find the ticket by ObjectId
    const ticket = await Ticket.findById(objectId)
      .populate("assignedTo")
      .populate("comments.employee")
      .populate("subtickets")
      .populate("author");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// bulk create and insert subtickets
router.post("/createSubtickets/:parentId", async (req, res) => {
  try {
    const parentId = req.params.parentId; // Parent ticket ID
    const subtickets = req.body.subtickets; // Subtickets data from the request body

    // Create subtickets
    const createdSubtickets = await Ticket.insertMany(subtickets); // Create all subtickets

    // Extract subticket IDs
    const subticketIds = createdSubtickets.map((ticket) => ticket._id);

    // Add subticket IDs to the parent ticket's subtickets array
    const updatedParentTicket = await Ticket.findByIdAndUpdate(
      parentId,
      { $push: { subtickets: { $each: subticketIds } } }, // Add subtickets to parent
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: "Subtickets created and added to the parent ticket successfully",
      createdSubtickets,
      updatedParentTicket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket status
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedSubtask = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedSubtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    res.status(200).json(updatedSubtask);
  } catch (error) {
    res.status(500).json({ message: "Failed to update subtask status", error });
  }
});

router.delete("/:ticketId", async (req, res) => {
  const { ticketId } = req.params;

  try {
    // delete all it's subtickets if exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (ticket.subtickets.length > 0) {
      await Ticket.deleteMany({ _id: { $in: ticket.subtickets } });
    }

    // delete the ticket
    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(deletedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
