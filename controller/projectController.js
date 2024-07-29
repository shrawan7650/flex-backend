const {
  contributionRegisterEmail,
} = require("../mailsend/flexMailSend/mailFlexHtmlHelper.js/registerrContributerHelper");
const {
  proposalEmail,
} = require("../mailsend/flexMailSend/mailFlexHtmlHelper.js/propsalHelperMail");
const { mailFlexSend } = require("../mailsend/flexMailSend/mailSend.Flex.help");
const { uploadFileOnCloudinary } = require("../utils/cloudinary/cloudniary");
const {
  aboutEmail,
} = require("../mailsend/flexMailSend/mailFlexHtmlHelper.js/aboutHelperMail");
const { userNewsletterEmail } = require("../mailsend/flexMailSend/mailFlexHtmlHelper.js/userNewsLetter");
const { adminNewsletterEmail } = require("../mailsend/flexMailSend/mailFlexHtmlHelper.js/adminNewsLetter");

exports.contributionRegister = async (req, res) => {
  try {
    const { name, yearGraduation, collegeName, number } = req.body;
    const { email } = req.params;

    console.log("Received data:", {
      name,
      email,
      yearGraduation,
      collegeName,
      number,
    });

    const emailContent = contributionRegisterEmail(
      name,
      yearGraduation,
      collegeName,
      number,
      email
    );
    console.log("Email content:", emailContent);

    const emailType = "ContributionRegister";
    const response = await mailFlexSend(emailType, emailContent,email);
    console.log("Email response:", response);
    if (response) {
      res
        .status(200)
        .json({ success: true, message: "Mail sent successfully" });
    }else{
      res.status(500).json({ success: false, message: "Failed to send mail" });
    }

  } catch (error) {
    console.error("Error sending mail:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.proposalController = async (req, res) => {
  try {
    const {
      name,
      number,
      email,
      jobrole,
      aboutYou,
      link,
      tech,
      title,
      coverabout,
      date,
      firstTalk,
    } = req.body;
    const avatarLocalPath = req.file?.path;
    // console.log("avatarLocalPath", avatarLocalPath);
    // console.log("name",name);
    // console.log("number",number);
    // console.log("email",email);
    // console.log("jobrole",jobrole);
    // console.log("aboutYou",aboutYou);
    // console.log("link",link);
    // console.log("tech",tech);
    // console.log("title",title);
    // console.log("coverabout",coverabout);
    // console.log("date",date);
    // console.log("firstTalk",firstTalk);

    if (!avatarLocalPath) {
      return res.status(400).send({ msg: "Avatar file is missing" });
    }

    const avatar = await uploadFileOnCloudinary(avatarLocalPath);
    console.log("avatar", avatar);
    // const avatar = "https://res.cloudinary.com/dmmnkipms/image/upload/v1719765912/xb11traegif6owncxvct.jpg";

    const emailContent = proposalEmail(
      name,
      number,
      email,
      jobrole,
      aboutYou,
      link,
      tech,
      title,
      coverabout,
      date,
      firstTalk,
      avatar
    );
    const emailType = "Proposal";
    const response = await mailFlexSend(emailType, emailContent,email);
    console.log("Email response:", response);
    if (response) {
      res
        .status(200)
        .json({ success: true, message: "Mail sent successfully" });
    }else{
      res.status(500).json({ success: false, message: "Failed to send mail" });
    }
  } catch (error) {
    console.error("Error submitting proposal:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.aboutContoller = async (req, res) => {
  try {
    const { fullName, email, number, message } = req.body;
    const emailContent = aboutEmail(fullName, email, number, message);
    const emailType = "About";
    const response = await mailFlexSend(emailType, emailContent,email);
    console.log("Email response:", response);
    if (response) {
      res
        .status(200)
        .json({ success: true, message: "Mail sent successfully" });
    }else{
      res.status(500).json({ success: false, message: "Failed to send mail" });
    }
  } catch (error) {
    console.error("Error sending about us mail:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.newslettlerController = async (req, res) => {
  try {
    const { email } = req.body;
    
    const userEmailContent = userNewsletterEmail();
    const adminEmailContent = adminNewsletterEmail(email);
    
    const emailType = "Newsletter";
    
    const response = await mailFlexSend(emailType, userEmailContent, email,adminEmailContent);
    console.log("Email response:", response);
    
    if (response) {
      res
        .status(200)
        .json({ success: true, message: "Mail sent successfully" });
    }else{
      res.status(500).json({ success: false, message: "Failed to send mail" });
    }
  } catch (error) {
    console.error("Error sending newsletter mail:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
