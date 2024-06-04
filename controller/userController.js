const User = require("../model/userSchema.models");
const Otp = require("../model/otpSchema.model");
const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../helpers/userAuth");
const { mailSend } = require("../mailsend/mailsend.helper");
const {
  registerEmail} = require("../mailsend/mailHtmlHelper/registerEmail.healper");
  const{sendRegisterOTPEmail}= require("../mailsend/mailHtmlHelper/registerOtpSend.helper")
const jwt = require("jsonwebtoken");
const cookies = require("cookies");



exports.sendSignupOtpController =    async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password should be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with the same email already exists" });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000);
    await Otp.create({
      email: email,
      code: otpCode,
      expireIn: new Date().getTime() + 300 * 1000, // 5 minutes
    });

    const emailType = "RegisterOTP";
    await mailSend(email, emailType, sendRegisterOTPEmail(otpCode));

    res.status(200).json({ msg: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifysignupcontroller = async (req, res) => {
  try {
    const { otp,email,username,password } = req.body;
    const user = await User.findOne({ email });
  
    const otpData = await Otp.findOne({ email });
    if (!otpData || otpData.code !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (otpData.expireIn < new Date().getTime()) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    const hashedPassword = await hashPassword({ password });

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const emailType = "Register";
    await mailSend(email, emailType, registerEmail(username));

    // Remove password from the response
    const userResponse = {
      _id: savedUser._id,
      email: savedUser.email,
      username: savedUser.username,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    res.status(200).json({
      msg: "Account created successfully",
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



//login controller logic
exports.logincontroller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check validation: all fields are fulfilled or not
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist" });
    }

    // compare password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY_TOKEN, {
      expiresIn: "1h", // set token expiry time
    });

    // set token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour in milliseconds
    });

    user.password = undefined; // remove password from response

    // send response
    res.status(200).json({ user, token, msg: "Logged in successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//send otp contoller logic
// otp send for forgetpassword
exports.otpSendforgot = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });
    console.log(user);
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   return res.status(400).send({
    //     msg: "Invalid email address",
    //   });
    // }

    if (!user) {
      return res.status(404).send({
        success: false,
        msg: "Email does not exist",
      });
    } else {
      let otpCode = Math.floor(1000 + Math.random() * 9000);
      if (otpCode >= 4) {
        otpCode = await Otp.create({
          email: email,
          code: otpCode,
          expireIn: new Date().getTime() + 300 * 1000,
        });
      }
      //  console.log(otpCode.code)
      //send otp of email
      // const emailType = "OTP";
      // const emailSendOtp = mailSend(
      //   email,
      //   emailType,
      //   sendOTPEmail(otpCode.code)
      // );

      res.status(200).send({
        msg: "Email has been sent",
        data: otpCode,
      });
    }
  } catch (err) {
    // console.error(err);
    res.status(500).send({ msg: err.message });
  }
};

//change pasword
exports.changePassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Find OTP for the user's email
    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      return res.status(400).json({ msg: "OTP not found or expired" });
    }

    // Check if OTP matches
    if (otpData.code !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // const passwordRegex =
    //   /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;
    // if (!passwordRegex.test(newPassword)) {
    //   return res.status(400).send({
    //     msg: "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol (!@#$%^&*)",
    //   });
    // }

    // Hash new password

    const hashedPassword = await hashPassword({ password });
    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Clear OTP after reset
    await Otp.deleteOne({ email });

    res.status(200).json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
  }
};
exports.userProfileController = async (req, res) => {
  try {
    //user id get from the middlewear
    const id = req.userId;
    // console.log("id",id)

    const user = await User.findById({ _id: id });
    user.password = undefined;
    res.send({ user });
  } catch (error) {
    res.json.status(500)({
      msg: error.message,
    });
  }
};
