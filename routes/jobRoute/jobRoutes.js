const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  adminMiddleware,
} = require("../../middlewear/authMiddlewear");
const upload = require("../../middlewear/multerMiddleweare");
const {
  postJobController,
  getAllJobsController,
  getJobsByAdminIdController,
  getSingleJobController,
  deleteJobByIdController,
  updateJobController,
  getAllMessageController,
  clearNotifications,
} = require("../../controller/jobController/jobController");
const Job = require("../../model/jobModel/jobSchema.model");

// Route to post a job (admin only)
router.post(
  "/post-job",
  upload.single("logo"),
  authMiddleware,
  adminMiddleware,
  postJobController
);

// Route to get all jobs (public access)
router.get("/all-jobs", getAllJobsController);

// Route to get all messages (public access)
router.get("/all-message-job", getAllMessageController);

// Route to get jobs by a specific user ID
router.get(
  "/jobs/admin/",
  authMiddleware,
  adminMiddleware,
  getJobsByAdminIdController
);

// Route to get a single job by ID
router.get(
  "/single-job/:id",
  authMiddleware,
  getSingleJobController
);

// Route to update a single job by ID

router.put(
  "/update-job/:id",
  upload.single("logo"),
  authMiddleware,
  adminMiddleware,
  updateJobController
);

// Route to delete a single job by ID
router.delete(
  "/delete-job/:id",
  authMiddleware,
  adminMiddleware,
  deleteJobByIdController
);
// Example Express.js endpoint to fetch similar jobs
router.get('/similar-jobs', async (req, res) => {
  try {
    const jobs = await Job.find().limit(10); // Fetch similar jobs logic
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching similar jobs' });
  }
});

// Route to clear notifications, ensure authentication
router.delete("/clear-notifications", authMiddleware, clearNotifications);


module.exports = router;
