const User = require("../../model/userModel/userSchema.models");
const Otp = require("../../model/userModel/otpModel/otpSchema.model");
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../../helpers/userAuth");

const {
  registerEmail,
} = require("../../mailsend/mailHtmlHelper/registerEmail.healper");
const {
  sendRegisterOTPEmail,
} = require("../../mailsend/mailHtmlHelper/registerOtpSend.helper");
const jwt = require("jsonwebtoken");

const userOtpVerificationModel = require("../../model/userModel/otpModel/userOtpVerification.model");
const { forgotOtp } = require("../../mailsend/mailHtmlHelper/forgotOtpEmail");
const TemporaryUser = require("../../model/userModel/otpModel/temporaryUserSchema.model");
const { uploadFileOnCloudinary } = require("../../utils/cloudinary/cloudniary");

const {
  mailFlexSend,
} = require("../../mailsend/flexMailSend/mailSend.Flex.help");

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
    const registerEmailContent = sendRegisterOTPEmail(otpCode);
    const emailType = "RegisterOTP";
    await mailFlexSend(emailType, registerEmailContent, email);

    return (varificationData = {
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

    const hashedPassword = await hashPassword(password);

    const newTempUser = new TemporaryUser({
      email,
      username,
      password: hashedPassword,
    });

    const savedTempUser = await newTempUser.save();

    const varificationData = await sendOtpVerificationEmail({
      result: savedTempUser,
      res,
    });
    //  console.log("varificationData",varificationData)
    if (varificationData.status === "FAILED") {
      return res.status(400).json({ msg: varificationData.msg });
    }

    res.json({
      status: "PENDING",
      message: "Signup successful. Please verify OTP.",
      data: {
        userId: savedTempUser._id,
        email: savedTempUser.email,
      },
    });
  } catch (err) {
    console.error("Error in sendSignupController:", err); // Log the error
    res.status(500).json({ error: err.message });
  }
};

exports.verifySignupController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { otp, email, name, city, state, phoneNumber, role } = req.body;

    console.log("email", email, "otp", otp);
    console.log(
      "name",
      name,
      "city",
      city,
      "state",
      state,
      "phoneNumber",
      phoneNumber
    );

    const profileImagePath =
      req.files && req.files["avatar"] ? req.files["avatar"][0].path : null;
    const resumePath =
      req.files && req.files["resume"] ? req.files["resume"][0].path : null;

    console.log("resumePath", resumePath);
    console.log("profileImagePath", profileImagePath);
    //image required user and admin both required
    if (!profileImagePath) {
      return res.status(400).json({ msg: "Profile image is required" });
    }

    // Resume validation for user role
    if (role === "user" && !resumePath) {
      return res.status(400).json({ msg: "Resume is required" });
    }
    //validation all req.body by seprate
    if (!name || !email || !phoneNumber || !city || !state || !role) {
      return res.status(400).json({ msg: "Please fill all required fields" });
    }
    if (phoneNumber.length !== 10) {
      return res.status(400).json({ msg: "Invalid phone number" });
    }
    if (city.length < 3) {
      return res.status(400).json({ msg: "Invalid city name" });
    }
    if (state.length < 3) {
      return res.status(400).json({ msg: "Invalid state name" });
    }
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    // Check if the temporary user exists
    const tempUser = await TemporaryUser.findOne({ email }).session(session);
    if (!tempUser) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Verify OTP
    const otpData = await userOtpVerificationModel
      .findOne({ email })
      .session(session);
    if (!otpData || otpData.code !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    if (new Date() > otpData.expiresAt) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    // Upload files to Cloudinary if provided
    let profileImageUrl, resumeUrl;

    if (profileImagePath) {
      profileImageUrl = await uploadFileOnCloudinary(profileImagePath);
      if (!profileImageUrl) {
        throw new Error("Error while uploading profile image");
      }
    }

    if (resumePath) {
      resumeUrl = await uploadFileOnCloudinary(resumePath);
      if (!resumeUrl) {
        throw new Error("Error while uploading resume");
      }
    }

    // Create new user object based on the role
    let newUser;
    if (role === "admin") {
      newUser = new User({
        email: tempUser.email,
        username: tempUser.username,
        password: tempUser.password,
        name: name,
        city: city,
        state: state,

        phoneNumber: phoneNumber,
        role: role,
        verified: true,
        avatarUrl: profileImageUrl,
      });
    } else {
      newUser = new User({
        email: tempUser.email,
        username: tempUser.username,
        password: tempUser.password,
        name: name,
        city: city,
        state: state,
        phoneNumber: phoneNumber,
        role: role,
        verified: true,
        niches: {
          firstNiche: req.body.firstNiche,
          secondNiche: req.body.secondNiche,
          thirdNiche: req.body.thirdNiche,
        },
        coverLetter: req.body.coverLetter,
        resumeUrl: resumeUrl,
        avatarUrl: profileImageUrl,
      });
    }

    // Save new user and clean up temporary data
    await newUser.save({ session });
    await TemporaryUser.deleteOne({ email }).session(session);
    await userOtpVerificationModel.deleteOne({ email }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send registration email
    const emailType = "Register";
    const registerEmailContent = registerEmail(newUser.username);
    await mailFlexSend(emailType, registerEmailContent, email);

    // Create JWT token and set it in cookies
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.SECRET_KEY_TOKEN,
      { expiresIn: "1h" }
    );

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
      userResponse,
      token,
    });
  } catch (err) {
    // Rollback transaction if any error occurs
    await session.abortTransaction();
    session.endSession();

    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.resendOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    // Check if the temporary user exists
    const tempUser = await TemporaryUser.findOne({ email });
    console.log("tempuser", tempUser);
    if (!tempUser) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Check if there is already an OTP entry and if it has expired
    const otpData = await userOtpVerificationModel.findOne({ email });
    if (otpData && new Date() <= otpData.expiresAt) {
      return res.status(400).json({ msg: "OTP has not yet expired" });
    }

    // Generate new OTP and send it via email
    const newOtp = generateOtp(); // Function to generate OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    await userOtpVerificationModel.findOneAndUpdate(
      { email },
      { code: newOtp, expiresAt },
      { upsert: true }
    );

    const varificationData = await sendOtpVerificationEmail({
      email,
      otp: newOtp,
    });

    if (varificationData.status === "FAILED") {
      return res.status(400).json({ msg: varificationData.msg });
    }

    res.json({
      status: "PENDING",
      message: "New OTP has been sent. Please verify OTP.",
    });
  } catch (err) {
    console.error("Error in resendOtpController:", err); // Log the error
    res.status(500).json({ error: err.message });
  }
};

// Helper function to generate OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

exports.logincontroller = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log(password, email);
    // Check validation: all fields are fulfilled or not
    if (!password || !(email || username)) {
      return res.status(400).json({ msg: "Please enter all the fields" });
    }

    // Find user by email or username
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    if (role !== user.role) {
      return res.status(400).json({ msg: "unauthorized access" });
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
    // // Set token as HTTP-only cookie
    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 3600000, // 1 hour
    //   sameSite: 'Strict', // Adjust based on your requirements (Strict, Lax, None)
    // });

    const userResponse = {
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Send response
    res
      .status(200)
      .json({ userResponse, token, msg: "Logged in successfully!" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// otp send for forgetpassword

exports.otpSendforgot = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });

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
      const forgotEmailContent = forgotOtp(otpCode, user.username);
      await mailFlexSend(emailType, forgotEmailContent, email);

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
    const { email, otp, newPassword } = req.body;
    console.log(email, otp, newPassword);
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
    const hashedPassword = await hashPassword(newPassword);

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
    // user id get from the middleware
    const id = req.userId;

    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.password = undefined;
    res.send({ user });
  } catch (error) {
    res.status(500).json({
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
        //redriect login
        redirectTo: "/login",
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateProfileController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.userId;
    const {
      name,
      email,
      city,
      state,
      number,
      firstNiche,
      secondNiche,
      thirdNiche,
      coverLetter,
      role,
    } = req.body;

    // Get resume and profile image paths from req.files
    const resumePath = req.files["resume"] ? req.files["resume"][0].path : null;
    const profileImagePath = req.files["avatar"]
      ? req.files["avatar"][0].path
      : null;

    console.log("resumePath", resumePath);
    console.log("profileImagePath", profileImagePath);

    // Find the user to update
    let user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({ msg: "User not found" });
    }

    // If a resume is provided and the user is a "user", upload it to Cloudinary
    if (role === "user" && !resumePath) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "Resume is required" });
    }

    let resumeUrl;
    if (resumePath) {
      resumeUrl = await uploadFileOnCloudinary(resumePath);
      if (!resumeUrl) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ msg: "Error while uploading resume" });
      }
    }

    let profileImageUrl;
    if (profileImagePath) {
      profileImageUrl = await uploadFileOnCloudinary(profileImagePath);
      if (!profileImageUrl) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .send({ msg: "Error while uploading profile image" });
      }
    }

    // Update fields based on role
    let updatedFields = {
      name: name || user.name,
      email: email || user.email,
      city: city || user.city,
      state: state || user.state,
      phoneNumber: number || user.phoneNumber,
      role: role || user.role,
      avatarUrl: profileImageUrl || user.avatarUrl,
    };

    if (role === "user") {
      updatedFields.niches = {
        firstNiche: firstNiche || user.niches.firstNiche,
        secondNiche: secondNiche || user.niches.secondNiche,
        thirdNiche: thirdNiche || user.niches.thirdNiche,
      };
      updatedFields.coverLetter = coverLetter || user.coverLetter;
      updatedFields.resumeUrl = resumeUrl || user.resumeUrl;
    }

    // Update user fields
    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
      session,
    });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .send({ msg: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    // If there was an error during the transaction, abort it
    await session.abortTransaction();
    session.endSession();

    console.error("Error in updateProfileController:", error); // Log the error
    return res
      .status(500)
      .send({ msg: "An error occurred while updating the profile." });
  }
};

exports.updatePasswordController = async (req, res) => {
  try {
    const userId = req.userId; // Assuming `userId` is set by your authMiddleware
    const { oldPassword, newPassword } = req.body;
    console.log("odPasword", oldPassword);
    console.log("newPassword", newPassword);
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ msg: "New password should be at least 6 characters long" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if the old password is correct

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }
    console.log("ismatch", isMatch);
    // Hash the new password
    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updatePasswordController:", error); // Log the error
    res.status(500).json({ msg: error.message });
  }
};
exports.NewUserShowingController = async (req, res) => {
  try {
    // Calculate the date one hour ago
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Find users created after this date and exclude admin users
    const users = await User.find({
      createdAt: { $gte: oneHourAgo },
      role: "user", // Only include users with the 'user' role
    });

    // Send the list of users in the response
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    // Send an error response if something goes wrong
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
