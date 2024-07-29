const User = require("../model/userSchema.models");
const Otp = require("../model/otpSchema.model");
const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../helpers/userAuth");
// const { mailSend } = require("../mailsend/mailsend.helper");
const {
  registerEmail,
} = require("../mailsend/mailHtmlHelper/registerEmail.healper");
const {
  sendRegisterOTPEmail,
} = require("../mailsend/mailHtmlHelper/registerOtpSend.helper");
const jwt = require("jsonwebtoken");

const userOtpVerificationModel = require("../model/userOtpVerification.model");
const { forgotOtp } = require("../mailsend/mailHtmlHelper/forgotOtpEmail");
const TemporaryUser = require("../model/temporaryUserSchema.model");
const { uploadFileOnCloudinary } = require("../utils/cloudinary/cloudniary");
const Bio = require("../model/bioSchema.model");
const { mailFlexSend } = require("../mailsend/flexMailSend/mailSend.Flex.help");

const sendOtpVerificationEmail = async ({ result, res }) => {
  try {
    const id = result._id.toString();
    const email = result.email;
    console.log("id kya hai bhai", id);
    console.log("email kya hai bhai", email);

    // Generate a random OTP code
    let otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Check for existing unverified OTP
    const existingOtp = await userOtpVerificationModel.findOne({ email });
    console.log(existingOtp);

    if (existingOtp) {
      console.log(`Reusing existing OTP: ${existingOtp.code}`);
      otpCode = existingOtp.code;
    } else {
      await userOtpVerificationModel.create({
        userId: id,
        email: email,
        code: otpCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Set expiration date to 5 minutes from now
      });
      console.log(`Generated new OTP: ${otpCode}`);
    }
const registerEmailContent =  sendRegisterOTPEmail(otpCode);
    const emailType = "RegisterOTP";
    await mailFlexSend( emailType,registerEmailContent,email);

    res.send({
      status: "PENDING",
      msg: "Verification OTP email sent",
      data: {
        userId: id,
        email: email,
      },
    });
  } catch (error) {
    console.error("Error in sendOtpVerificationEmail:", error); // Log the error
    res.send({
      status: "FAILED",
      message: error.message,
    });
  }
};

const cleanUpExpiredTempUsers = async (email) => {
  const expirationTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
  await TemporaryUser.deleteMany({ email, createdAt: { $lt: expirationTime } });
};

exports.sendSignupController = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!password || !(email || username)) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password should be at least 6 characters" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with the same email already exists" });
    }

    // Clean up expired temporary users
    await cleanUpExpiredTempUsers(email);

    const existingTempUser = await TemporaryUser.findOne({ email });
    if (existingTempUser) {
      return res
        .status(400)
        .json({ msg: "OTP already sent. Please verify OTP." });
    }

    const hashedPassword = await hashPassword({ password });

    const newTempUser = new TemporaryUser({
      email,
      username,
      password: hashedPassword,
    });

    const savedTempUser = await newTempUser.save();

    await sendOtpVerificationEmail({ result: savedTempUser, res });
  } catch (err) {
    console.error("Error in sendSignupController:", err); // Log the error
    res.status(500).json({ error: err.message });
  }
};

exports.verifySignupController = async (req, res) => {
  try {
    const { otp, email } = req.body;
    console.log(email, otp);

    const tempUser = await TemporaryUser.findOne({ email });
    if (!tempUser) {
      return res.status(400).json({ msg: "User not found" });
    }

    const otpData = await userOtpVerificationModel.findOne({ email });
    if (!otpData || otpData.code !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (new Date() > otpData.expiresAt) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    const newUser = new User({
      email: tempUser.email,
      username: tempUser.username,
      password: tempUser.password,
      verified: true,
    });

    await newUser.save();

    await TemporaryUser.deleteOne({ email });
    await userOtpVerificationModel.deleteOne({ email });

    const emailType = "Register";
    const registerEmailContent =  registerEmail(newUser.username);
    await mailFlexSend(emailType,registerEmailContent,email);

    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
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
    console.log(password, email);
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

    if (!user) {
      return res.status(404).send({
        success: false,
        msg: "Email does not exist",
      });
    } else {
      let otpCode;
      const existingOtp = await Otp.findOne({ email, verified: false });

      if (existingOtp) {
        const currentTime = new Date();
        if (currentTime < existingOtp.expiresAt) {
          // Reuse existing unverified OTP if it's within the 5-minute window
          otpCode = existingOtp.code;
          console.log(`Reusing existing OTP: ${otpCode}`);
        } else {
          // If existing OTP has expired, delete it and generate a new OTP
          await Otp.deleteOne({ email, verified: false });
          otpCode = Math.floor(1000 + Math.random() * 9000).toString();
          await Otp.create({
            email: email,
            code: otpCode,
            verified: false,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Set expiration date to 5 minutes from now
          });
          console.log(`Generated new OTP: ${otpCode}`);
        }
      } else {
        // Generate a new OTP if no existing unverified OTP is found
        otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        await Otp.create({
          email: email,
          code: otpCode,
          verified: false,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Set expiration date to 5 minutes from now
        });
        console.log(`Generated new OTP: ${otpCode}`);
      }

      // Send OTP via email
      const emailType = "ForgetOTP";
      const forgotEmailContent = forgotOtp(otpCode,user. username);
      await mailFlexSend(emailType,forgotEmailContent,email );

      res.status(200).send({
        success: true,
        msg: "Email has been sent",
        data: { email, otpCode },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: err.message });
  }
};

//change pasword
exports.changePassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    console.log(email, otp, password);
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

    // Check if OTP has expired
    const currentTime = new Date();
    if (currentTime > otpData.expiresAt) {
      // If OTP has expired, prevent password change and return error
      return res.status(400).json({ msg: "OTP has expired" });
    }

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


exports.updateProfileController = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      name,
      email,
      collageName,
      githubLink,
      phoneNumber,
      state,
    } = req.body;


    console.log("name", name)
    console.log("email", email)
    console.log("collageName", collageName)
    console.log("githubLink", githubLink)
    console.log("phoneNumber", phoneNumber)
    console.log("state", state)


    console.log("userId", userId)




    const avatarLocalPath = req.file?.path;
    console.log("avatarLocalPath", avatarLocalPath)
    // Find the user to update
    let user = await User.findById(userId);
    console.log("user", user)
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    // If an avatar is provided, upload it to Cloudinary
    let avatar;
    if (avatarLocalPath) {
      avatar = await uploadFileOnCloudinary(avatarLocalPath);
      if (!avatar) {
        return res.status(400).send({ msg: "Error while uploading avatar" });
      }
    }

    // Update user fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name || user.name,
        email: email || user.email,
        collageName: collageName || user.collageName,
        githubLink: githubLink || user.githubLink,
        phoneNumber: phoneNumber || user.phoneNumber,
        state: state || user.state,
        image: avatar ? avatar : user.image,
      },
      { new: true }
    );

    // Save the updated user
    await updatedUser.save();

    return res.status(200).send({ msg: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};


exports.bioUpdateController = async (req, res) => {
  try {
    const userId = req.userId;
    const { userBio, userExperience, languages } = req.body;
    console.log(languages, userExperience, userBio);

    // Find the user and populate the bio reference
    const user = await User.findById(userId).populate('bio');

    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    // Check if the user has an existing bio
    if (user.bio) {
      // If the bio exists, update it
      const bioUpdateUser = await Bio.findByIdAndUpdate(user.bio._id, {
        userBio: userBio || user.bio.userBio,
        userExperience: userExperience || user.bio.userExperience,
        languages: languages ? (Array.isArray(languages) ? languages : languages.split(',')) : user.bio.languages,
      }, { new: true });

      await bioUpdateUser.save();
    } else {
      // If the bio does not exist, create a new one
      const newBio = new Bio({
        user: user._id,
        userBio,
        userExperience,
        languages: languages ? (Array.isArray(languages) ? languages : languages.split(',')) : [],
      });

      const savedBio = await newBio.save();

      // If the user did not have a bio, associate the new bio with the user
      user.bio = savedBio._id;
      await user.save();

      return res.status(200).send({ msg: "Bio updated successfully", bio: savedBio });
    }

    return res.status(200).send({ msg: "Bio updated successfully" });
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};


exports.bioGetDataController = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the user and populate the bio reference
    const user = await User.findById(userId).populate('bio');

    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    // Check if the user has an existing bio
    if (!user.bio) {
      return res.status(404).send({ msg: "Bio not found" });
    }

    return res.status(200).send(user.bio);
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};

