const mongoose = require("mongoose");

const studentApplicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student ID is required"]
  },
  studentName: {
    type: String,
    required: [true, "Student name is required"],
    trim: true,
    maxlength: [50, "Student name cannot exceed 50 characters"]
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventRequest",
    required: [true, "Event ID is required"]
  },
  eventTitle: {
    type: String,
    required: [true, "Event title is required"],
    trim: true
  },
  applicationDetails: {
    type: String,
    required: [true, "Application details are required"],
    trim: true,
    minlength: [20, "Application must be at least 20 characters"],
    maxlength: [500, "Application cannot exceed 500 characters"]
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "approved", "rejected", "waitlisted"],
      message: "Invalid application status"
    },
    default: "pending"
  },
  clubRemarks: {
    type: String,
    trim: true,
    maxlength: [200, "Remarks cannot exceed 200 characters"]
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
studentApplicationSchema.index({ studentId: 1 });
studentApplicationSchema.index({ eventId: 1 });
studentApplicationSchema.index({ status: 1 });

// Pre-save hook to add event title if not provided
studentApplicationSchema.pre("save", async function(next) {
  if (!this.eventTitle && this.eventId) {
    const event = await mongoose.model("EventRequest").findById(this.eventId);
    if (event) this.eventTitle = event.eventTitle;
  }
  next();
});

// Virtual for formatted application date
studentApplicationSchema.virtual("formattedAppliedAt").get(function() {
  return this.appliedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
});

// Static method to find applications by status
studentApplicationSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ appliedAt: -1 });
};

// Static method to get applications for an event
studentApplicationSchema.statics.forEvent = function(eventId) {
  return this.find({ eventId }).sort({ appliedAt: -1 });
};

// Static method to get student's applications
studentApplicationSchema.statics.byStudent = function(studentId) {
  return this.find({ studentId }).sort({ appliedAt: -1 });
};

// Instance method to approve application
studentApplicationSchema.methods.approve = function(remarks = "") {
  this.status = "approved";
  this.clubRemarks = remarks;
  this.processedAt = new Date();
  return this.save();
};

// Instance method to reject application
studentApplicationSchema.methods.reject = function(remarks = "") {
  this.status = "rejected";
  this.clubRemarks = remarks;
  this.processedAt = new Date();
  return this.save();
};

// Instance method to add attachment
studentApplicationSchema.methods.addAttachment = function(name, url) {
  this.attachments.push({ name, url });
  return this.save();
};

module.exports = mongoose.model("StudentApplication", studentApplicationSchema);