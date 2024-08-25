const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../../middlewear/authMiddlewear");
const { applyJobController, getApplicantsByJobId ,getUserNotifications,getMyAppliedJobs,clearNotifications, jobStatusUpdate} = require("../../controller/applicationController/applicantController");
const upload = require("../../middlewear/multerMiddleweare");




// Route to post a job (admin only)
router.post("/applyJob/:id",authMiddleware, upload.single("resume"),applyJobController);


// Fetch applications for jobs posted by a specific admin
router.get('/admin/applications/:adminId',getApplicantsByJobId);

//get my applies job

router.get('/my-applies',authMiddleware, getMyAppliedJobs);



// // Route to get all jobs (public access)
router.get("/all-message-admin", getUserNotifications);

// // Route to get jobs by a specific user ID
// router.get('/jobs/admin/', authMiddleware, adminMiddleware, getJobsByAdminIdController);

// // Route to get a single job by ID
// router.get('/single-job/:id', authMiddleware, adminMiddleware, getJobByIdController);

// // Route to delete a single job by ID
// router.delete('/delete-job/:id', authMiddleware,adminMiddleware, deleteJobByIdController);
router.delete("/clear-notifications", authMiddleware, clearNotifications);
router.patch('/job-status/:id/status',authMiddleware,adminMiddleware,jobStatusUpdate)

module.exports = router;
