const mongoose = require("mongoose");

const eventRequestSchema = new mongoose.Schema({
  clubName: String,
  eventTitle: String,
  description: String,
  date: Date,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "changes_requested"],
    default: "pending"
  },
  authorityRemarks: String
});

module.exports = mongoose.model("EventRequest", eventRequestSchema);