const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    enum: ['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyLogo: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
  jobIntroduction: {
    type: String,
    required: true,
  },
  responsibilities: {
    type: String,
    required: true,
  },
  qualifications: {
    type: String,
    required: true,
  },
  jobNiche: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  jobStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Closed'],
    default: 'Active',
    required: true,
  },
  applicationDeadline: {
    type: Date,
    required: true,
  },
  workLevels: [
    {
      level: {
        type: String,
        required: true,
      },
      experience: {
        type: String,
        required: true,
      },
    },
  ],
 

  languages: [
    {
      language: {
        type: String,
        required: true,
      },
      proficiency: {
        type: String,
        required: true,
      },
    },
  ],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
