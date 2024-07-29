const express = require('express');
const router = express.Router();




// require function from controller
const{sendSignupController,logincontroller,otpSendforgot,changePassword,userProfileController,verifySignupController,logout,updateProfileController,bioUpdateController,bioGetDataController}=require('../../controller/userController.js');
const {varifyToken} = require("../../middlewear/authMiddlewear");
const { upload } = require('../../middlewear/multerMiddleweare.js');



// Routes

router.post('/signup', sendSignupController);
router.post('/verify', verifySignupController);
router.post('/login', logincontroller);
router.post('/forgot', otpSendforgot);
router.post('/changepassword', changePassword);
router.get('/logout',varifyToken, logout);
router.get('/profile', varifyToken, userProfileController);
router.patch('/updateProfile', varifyToken, upload.single("avatar"),updateProfileController);
router.patch('/bioUpdateuser', varifyToken, bioUpdateController);
router.get('/getBioData', varifyToken, bioGetDataController);
// router.patch(
//   "/updateAvatar",
//   varifyToken,
//   upload.single("avatar"),
//   updateUserAvatar,
// );


 module.exports = router;