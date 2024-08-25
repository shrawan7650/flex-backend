const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    email: {
      type: String,
      required: true,
     
      trim: true,
      lowercase: true,
    },
    name: { type: String, default: null },
    phone: { type: String, default: null },
    resume: { type: String, default: null },
    jobId: {
       type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Shortlisted", "Selected", "Rejected"],
      default: "Pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Applicant = mongoose.model("Applicant", applicantSchema);

module.exports = Applicant;
