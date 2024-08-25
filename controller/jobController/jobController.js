const { mongo, default: mongoose } = require("mongoose");
const AdminMessage = require("../../model/adminMessageModel/adminModelessage");
const Job = require("../../model/jobModel/jobSchema.model");
const UserNotification = require("../../model/userMessageModel/userModelMessage");
const User = require("../../model/userModel/userSchema.models");
const { uploadFileOnCloudinary } = require("../../utils/cloudinary/cloudniary");
const { SendJobAlerts } = require("../../helpers/autmationEmail/AutomationEmail");

 

// Function to create a notification message

//yah funtion admin creat kar rah jo ki user ko dikha notfication
const createNotification = async (userId, title, companyName) => {
  try {
    const notification = {
      messageTitle: "New Job Posted",
      messageContent: `A new job titled "${title}" has been posted by ${companyName}. Check it out!`,
      userId: userId,
      status: 'unread',
    };

    // Store the notification message
    await UserNotification.create(notification);
  } catch (error) {
    console.error("Error creating notification:", error.message);
    throw new Error("Failed to create notification");
  }
};



exports.postJobController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;
    console.log('User ID:', userId);
    const {
      title,
      companyName,
      jobType,
      location,
      jobIntroduction,
      responsibilities,
      qualifications,
      salary,
      niche,
      jobStatus,
      applicationDeadline,
      workLevels,
      languages,
    } = req.body;
    const logoPath = req.file ? req.file.path : null;
      // Logging each property in the request body
  console.log('Title:', title);
  console.log('Company Name:', companyName);
  console.log('Job Type:', jobType);
  console.log('Location:', location);
  console.log('Job Introduction:', jobIntroduction);
  console.log('Responsibilities:', responsibilities);
  console.log('Qualifications:', qualifications);
  console.log('Salary:', salary);
  console.log('Niche:', niche);
  console.log('Job Status:', jobStatus);
  console.log('Application Deadline:', applicationDeadline);
  console.log('Work Levels:', workLevels);
  console.log('Languages:', languages);
  console.log('Logo Path:', logoPath);


    // Parse workLevels and languages if they are strings
    let parsedWorkLevels = workLevels;
    let parsedLanguages = languages;
    if (typeof workLevels === 'string') {
      parsedWorkLevels = JSON.parse(workLevels);
    }
    if (typeof languages === 'string') {
      parsedLanguages = JSON.parse(languages);
    }
    console.log('Parsed Work Levels:', parsedWorkLevels);
    console.log('Parsed Languages:', parsedLanguages);





    // Validate input data
    if (
      !title ||
      !companyName ||
      !jobType ||
      !location ||
      !jobIntroduction ||
      !responsibilities ||
      !qualifications ||
      !salary ||
      !niche ||
      !jobStatus ||
      !applicationDeadline ||
      !parsedWorkLevels ||
      !parsedLanguages
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!logoPath) {
      return res.status(400).json({ error: "Logo is required" });
    }

    // Upload the logo to Cloudinary if provided
    const logoUrl = await uploadFileOnCloudinary(logoPath);
// const logoUrl = "xyz.png"
    // Create the job
    const newJob = new Job({
      title,
      companyName,
      jobType,
      location,
      jobIntroduction,
      responsibilities,
      qualifications,
      salary,
      jobNiche: niche,
      jobStatus,
      applicationDeadline,
      workLevels: parsedWorkLevels,
      languages: parsedLanguages,
      postedBy: userId,
      companyLogo: logoUrl,
    });

    const savedJob = await newJob.save({ session });
    console.log("saved job",savedJob)

    // Create and store notification message
    await createNotification(userId, title, companyName, { session });
    await SendJobAlerts(savedJob)

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(savedJob);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(400).json({ error: error.message });
  }
};


exports.getAllJobsController = async (req, res) => {
  try {
    // Fetch all jobs from the database
    const jobs = await Job.find();

    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error("Error in getAllJobsController:", error); // Log the error
    res.status(500).json({ msg: "Server error" });
  }
};
exports.getAllMessageController = async(req,res)=>{
  try {
    // Fetch all jobs from the database
    const messageData = await  AdminMessage.find().populate("senderId");

    res.status(200).json({ success: true, messageData });
  } catch (error) {
    console.error("Error in getAllJobsController:", error); // Log the error
    res.status(500).json({ msg: "Server error" });
  }
}
// Function to get jobs by a specific user ID
exports.getJobsByAdminIdController = async (req, res) => {
  try {
    const userId = req.userId; // Get the user ID from request parameters

    // Validate if the user ID is provided
    if (!userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    // Find jobs posted by the specific user
    const jobs = await Job.find({ postedBy: userId });

    // Check if any jobs are found
    if (jobs.length === 0) {
      return res.status(404).json({ msg: "No jobs found for this user" });
    }

    res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error("Error in getJobsByUserIdController:", error); // Log the error
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getSingleJobController = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate("postedBy");
    
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    console.error("Error in getSingleJobController:", error); // Log the error
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteJobByIdController = async (req, res) => {
  try {
    const jobId = req.params.id; // Get job ID from request parameters

    // Find and delete the job by ID
    const deletedJob = await Job.findByIdAndDelete(jobId);

    // Check if the job was found and deleted
    if (!deletedJob) {
      return res.status(404).json({ msg: "Job not found" });
    }

    res.status(200).json({ success: true, msg: "Job deleted successfully" });
  } catch (error) {
    console.error("Error in deleteJobByIdController:", error); // Log the error
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateJobController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.userId;
    const {
      title,
      companyName,
      jobType,
      location,
      jobIntroduction,
      responsibilities,
      qualifications,
      salary,
      niche,
      jobStatus,
      applicationDeadline,
      workLevels,
      languages,
    } = req.body;
    const logoPath = req.file ? req.file.path : null;

    // Find the existing job
    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }
  // Parse workLevels and languages if they are strings
  let parsedWorkLevels = workLevels;
  let parsedLanguages = languages;
  if (typeof workLevels === 'string') {
    parsedWorkLevels = JSON.parse(workLevels);
  }
  if (typeof languages === 'string') {
    parsedLanguages = JSON.parse(languages);
  }
    // Validate input data
    if (
      !title &&
      !companyName &&
      !jobType &&
      !location &&
      !jobIntroduction &&
      !responsibilities &&
      !qualifications &&
      !salary &&
      !niche &&
      !jobStatus &&
      !applicationDeadline &&
      !workLevels &&
      !languages &&
      !logoPath
    ) {
      return res.status(400).json({ error: "At least one field is required to update" });
    }

    // Upload the logo to Cloudinary if provided
    let logoUrl;
    if (logoPath) {
      logoUrl = await uploadFileOnCloudinary(logoPath);
    }

    // Prepare the updated job object
    const updatedJob = {
      title: title || existingJob.title,
      companyName: companyName || existingJob.companyName,
      jobType: jobType || existingJob.jobType,
      location: location || existingJob.location,
      jobIntroduction: jobIntroduction || existingJob.jobIntroduction,
      responsibilities: responsibilities || existingJob.responsibilities,
      qualifications: qualifications || existingJob.qualifications,
      salary: salary ? salary : existingJob.salary,
      jobNiche: niche || existingJob.jobNiche,
      jobStatus: jobStatus || existingJob.jobStatus,
      applicationDeadline: applicationDeadline || existingJob.applicationDeadline,
      workLevels: parsedWorkLevels || existingJob.workLevels,
      languages: parsedLanguages || existingJob.languages,
      companyLogo: logoUrl || existingJob.companyLogo,
      postedBy: userId || existingJob.postedBy, // Ensuring userId is retained
    };

    const job = await Job.findByIdAndUpdate(id, updatedJob, { new: true, session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(job);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Controller function to clear notifications for a user
exports.clearNotifications = async (req, res) => {
  try {
    const userId = req.userId; // Assumes userId is set in the request (e.g., from authentication middleware)

    // Clear notifications for the user
    await AdminMessage.deleteMany({ senderId: userId });

    res.status(200).json({ message: "All notifications cleared successfully" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ error: "An error occurred while clearing notifications" });
  }
};


