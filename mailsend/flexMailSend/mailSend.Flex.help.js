require("dotenv").config();
const nodemailer = require("nodemailer");

exports.mailFlexSend = async (emailType, html, email, htmladmin) => {
  console.log("emailtype",emailType)
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptionsAdmin = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME, // Admin's email
      subject: getSubject(emailType),
      html: htmladmin,
    };

    const mailOptionsUser = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: getSubject(emailType),
      html: html,
    };

    if (emailType === "Newsletter") {
      // Send email to admin
      const infoAdmin = await transporter.sendMail(mailOptionsAdmin);
      console.log(`Newsletter Email sent to admin: ${infoAdmin.response}`);

         // Send email to user
         const infoUser = await transporter.sendMail(mailOptionsUser);
         console.log(`Newsletter Email sent to user: ${infoUser.response}`);
    } else {
    // Send email to user
    const infoUser = await transporter.sendMail(mailOptionsUser);
    console.log(`${emailType} Email sent to user: ${infoUser.response}`);
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

function getSubject(emailType) {
  switch (emailType) {
    case "Register":
      return "Welcome to Our FlexiGeeks Project";
    case "ForgetOTP":
      return "ForgetOTP account";
    case "RegisterOTP":
      return "OTP Verification";
    case "ContributionRegister":
      return "New Contribution Registered";
    case "Proposal":
      return "New Proposal Submitted";
    case "About":
      return "New About Us Submission";
    case "Newsletter":
      return "FlexiGeeks Newsletter Signup";

    default:
      throw new Error("Invalid email type");
  }
}
