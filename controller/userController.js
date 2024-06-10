const User = require("../model/userSchema.models");
const Otp = require("../model/otpSchema.model");
const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../helpers/userAuth");
const { mailSend } = require("../mailsend/mailsend.helper");
const {
  registerEmail,
} = require("../mailsend/mailHtmlHelper/registerEmail.healper");
const {
  sendRegisterOTPEmail,
} = require("../mailsend/mailHtmlHelper/registerOtpSend.helper");
const jwt = require("jsonwebtoken");

const userOtpVerificationModel = require("../model/userOtpVerification.model");
const { forgotOtp } = require("../mailsend/mailHtmlHelper/forgotOtpEmail");

const sendOtpVerificationEmail = async ({ result, res }) => {
  try {
    const id = result._id.toString();
    const email = result.email;
    console.log("id kya hai bhai", id);
    console.log("email kya hai bhai", email);

    const otpCode = Math.floor(1000 + Math.random() * 9000);
    await userOtpVerificationModel.create({
      userId: id,
      email: email,
      code: otpCode,
      expireIn: new Date().getTime() + 300 * 1000, // 5 minutes
    });

    const emailType = "RegisterOTP";
    await mailSend(email, emailType, sendRegisterOTPEmail(otpCode));

    res.send({
      status: "PENDING",
      msg: "Verification Otp email sent",
      data: {
        userId: id,
        email: email,
      },
    });
  } catch (error) {
    res.send({
      status: "FAILED",
      message: error.message,
    });
  }
};

exports.sendSignupController = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password should be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with the same email already exists" });
    }

    const hashedPassword = await hashPassword({ password });

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      verified: false,
    });

    const savedUser = await newUser.save();

    await sendOtpVerificationEmail({ result: savedUser, res });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifySignupController = async (req, res) => {
  try {
    const { otp, email } = req.body;
    console.log(email, otp);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const otpData = await userOtpVerificationModel.findOne({ email });
    if (!otpData || otpData.code !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (otpData.expireIn < new Date().getTime()) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    user.verified = true;
    await user.save();

    await userOtpVerificationModel.deleteOne({ email });

    const emailType = "Register";
    await mailSend(email, emailType, registerEmail(user.username));

    const userResponse = {

      _id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      msg: "Account verified and created successfully",
      success: true,
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logincontroller = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(password,email);
    // Check validation: all fields are fulfilled or not
    if (!password || !(email || username)) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    // Find user by email or username
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email or username does not exist" });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Compare password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY_TOKEN, {
      expiresIn: "1hr", // Set token expiry time
    });

    // Set token as HTTP-only cookie
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: true, // Secure flag should be true in production
    //   maxAge: 3600000, // 1 hour in milliseconds
    // });

    user.password = undefined; // Remove password from response

    // Send response
    res.status(200).json({ user, token, msg: "Logged in successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
      const emailType = "ForgetOTP";
      const emailSendOtp = mailSend(email, emailType, forgotOtp(otpCode.code));

      res.status(200).send({
        success: true,
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
console.log(email,otp,password)
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

    res.status(200).json({ msg: "Password reset successfully", success: true });
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

//logout
exports.logout = async (req, res) => {
  try {
    console.log(req.userId);
    res
      .status(201)
      .cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
      })
      .json({
        success: true,
        msg: "Logged Out Successfully.",
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
