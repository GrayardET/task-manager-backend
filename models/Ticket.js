// models/Ticket.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ticketSchema = new Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ticketName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "Employee",
        required: false,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      default: "66e06f48dcadba975016eabd",
    },
    subtickets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Complete", "Verify", "Issue"],
      default: "Pending",
      required: true,
    },
    comments: [commentSchema],
    type: {
      type: String,
      enum: ["Task", "Bug", "Feature"],
      default: "Task",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
