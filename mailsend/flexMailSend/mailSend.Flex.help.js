require("dotenv").config();
const nodemailer = require("nodemailer");

exports.mailFlexSend = async (email, emailType, html) => {
  try {
    let transporter;
    console.log(emailType);
    switch (emailType) {
      case "ContributionRegister":
        transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          secure: true,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        break;
      case "Proposal":
        transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          secure: true,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        break;
      case "About":
        transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          secure: true,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        break;
      case "Newsletter":
        transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          secure: true,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        break;

      default:
        throw new Error("Invalid email type");
    }

    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // Admin's email

      subject: getSubject(emailType),
      html: html,
    };
    // Send email to admin
    mailOptions.to = process.env.EMAIL_USERNAME;

    const info = await transporter.sendMail(mailOptions);

    // Optionally send email to user based on email type
    if (emailType === "Newsletter") {
      mailOptions.to = email;
      const userInfo = await transporter.sendMail(mailOptions);
      console.log(`${emailType} Email sent to user: ${userInfo.response}`);
    }
    console.log(`${emailType} Email sent: ${info.response}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

function getSubject(emailType) {
  switch (emailType) {
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
