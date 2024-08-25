const express = require("express");
const router = express.Router();

// require function from controller
const {
  sendSignupController,
  logincontroller,
  otpSendforgot,
  changePassword,
  userProfileController,
  verifySignupController,
  logout,
  updateProfileController,
  updatePasswordController,
  resendOtpController,
  NewUserShowingController
} = require("../../controller/userController/userController.js");
const { authMiddleware } = require("../../middlewear/authMiddlewear");
const upload = require("../../middlewear/multerMiddleweare.js");

// Routes

router.post("/signup", sendSignupController);
router.post(
  "/verification",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  verifySignupController
);
router.post('/resend-otp', resendOtpController);
router.post("/login", logincontroller);
router.post("/forgot-password", otpSendforgot);
router.post("/change-password", changePassword);
router.get("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, userProfileController);
router.patch(
  "/update-profile",
  authMiddleware,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateProfileController
);
router.put("/update-password", authMiddleware, updatePasswordController);


// Get users registered in the last two days
router.get('/last-2-days', NewUserShowingController);
module.exports = router;
