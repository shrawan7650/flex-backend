require("dotenv").config();
const nodemailer = require("nodemailer");

exports.mailFlexSend = async (emailType, html, email) => {
  console.log("emailType", emailType);
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptionsUser = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: getSubject(emailType),
      html: html,
    };

    const infoUser = await transporter.sendMail(mailOptionsUser);
    console.log(`${emailType} Email sent to user: ${infoUser.response}`);
    
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
    case "Alert":
      return "Job Alert - New Job Posted";
    default:
      throw new Error("Invalid email type");
  }
}
