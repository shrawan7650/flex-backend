const express = require('express');
const router = express.Router();




// require function from controller
const{sendSignupOtpController,logincontroller,otpSendforgot,changePassword,userProfileController,verifysignupcontroller}=require('../../controller/userController.js');
const {varifyToken} = require("../../middlewear/authMiddlewear")


// Routes

router.post('/signup', sendSignupOtpController);
router.post('/verify', verifysignupcontroller);
router.post('/login', logincontroller);
router.post('/forgot', otpSendforgot);
router.post('/changepassword', changePassword);
router.get('/profile', varifyToken, userProfileController);
 module.exports = router;