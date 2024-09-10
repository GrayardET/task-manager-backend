const express = require("express");
const mongoose = require("mongoose");

// Scehma definition
const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlenght: 3,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: "Invalid URL format.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
