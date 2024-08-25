const { default: mongoose } = require("mongoose");
const Applicant = require("../../model/applicationModel/applicationSchemaModel");
const Job = require("../../model/jobModel/jobSchema.model");
const { uploadFileOnCloudinary } = require("../../utils/cloudinary/cloudniary");
const AdminMessage = require("../../model/adminMessageModel/adminModelessage");
const UserNotification = require("../../model/userMessageModel/userModelMessage");
//yah funtion user creat kar rah jo ki admin ko dikha notfication
const createAdminNotification = async (userId, jobTitle, applicantName) => {
  try {
    const notification = {
      messageContent: `User ${applicantName} has applied for the job titled "${jobTitle}".`,
      senderId: userId,
      status: "unread",
    };

    // Store the notification message
    await AdminMessage.create(notification);
  } catch (error) {
    console.error("Error creating admin notification:", error.message);
    throw new Error("Failed to create notification");
  }
};

exports.applyJobController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, location, email, name, phone, resumedataUrl } = req.body;
    const userId = req.userId;
    const jobId = req.params.id;

    console.log("jobId:", jobId);
    console.log("userId:", userId);
    console.log("resumedataUrl:", resumedataUrl);

    // Determine resumePath based on whether a new file is uploaded or an existing URL is provided
    const resumePath = req.file
      ? req.file.path
      : Array.isArray(resumedataUrl)
      ? resumedataUrl[0]
      : resumedataUrl;

    const trimmedJobId = jobId.trim();
    const trimmedUserId = userId.trim();

    if (
      !mongoose.Types.ObjectId.isValid(trimmedJobId) ||
      !mongoose.Types.ObjectId.isValid(trimmedUserId)
    ) {
      return res.status(400).json({ error: "Invalid jobId or userId" });
    }

    let resumeUrl;
    if (req.file) {
      // Upload the file to Cloudinary if a new file is uploaded
      resumeUrl = await uploadFileOnCloudinary(resumePath);
    } else {
      // Use the existing URL directly
      resumeUrl = resumePath;
    }

    console.log("resumeUrl:", resumeUrl);

    const applicant = new Applicant({
      title,
      location,
      email,
      name,
      phone,
      resume: resumeUrl, // This is the URL of the uploaded resume
      jobId: trimmedJobId,
      userId: trimmedUserId,
    });

    await applicant.save({ session });
    await createAdminNotification(userId, title, name, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Application submitted successfully",
      data: applicant,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
exports.getApplicantsByJobId = async (req, res) => {
  try {
    const adminId = req.params.adminId.trim();

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: "Invalid jobId or userId" });
    }
    // Find jobs posted by the admin
    const jobs = await Job.find({ postedBy: adminId });
    console.log("jobsIddd", jobs);
    const jobIds = jobs.map((job) => job._id);
    console.log("jobsIsss", jobIds);
    // Find applications for those jobs
    const applications = await Applicant.find({ jobId: { $in: jobIds } })
      .populate("jobId")
      .populate("userId");
    console.log("applicant", applications);

    res.status(200).json(applications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// applican mai user notificaton la rha hia
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await UserNotification.find();

    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//my applied job get

exports.getMyAppliedJobs = async (req, res) => {
  try {
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const applications = await Applicant.find({ userId }).populate("jobId");
    res.status(200).json(applications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    const userId = req.userId; // Assumes userId is set in the request (e.g., from authentication middleware)
    console.log("userId", userId);
    // Clear notifications for the user
    await UserNotification.deleteMany();

    res.status(200).json({ message: "All notifications cleared successfully" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res
      .status(500)
      .json({ error: "An error occurred while clearing notifications" });
  }
};
// Update applicant status route
exports.jobStatusUpdate =  async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find the applicant by ID and update their status
    const applicant = await Applicant.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Returns the updated document
    );
console.log("applicant",applicant)
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    res.status(200).json({ message: 'Status updated successfully', applicant });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
