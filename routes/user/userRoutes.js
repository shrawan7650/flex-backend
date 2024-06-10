const express = require('express');
const router = express.Router();




// require function from controller
const{sendSignupController,logincontroller,otpSendforgot,changePassword,userProfileController,verifySignupController,logout}=require('../../controller/userController.js');
const {varifyToken} = require("../../middlewear/authMiddlewear")


// Routes

router.post('/signup', sendSignupController);
router.post('/verify', verifySignupController);
router.post('/login', logincontroller);
router.post('/forgot', otpSendforgot);
router.post('/changepassword', changePassword);
router.get('/logout',varifyToken, logout);
router.get('/profile', varifyToken, userProfileController);
 module.exports = router;