const { mailFlexSend } = require("../../mailsend/flexMailSend/mailSend.Flex.help");
const createJobAlertEmailTemplate = require("../../mailsend/mailHtmlHelper/autmationEmail");


const sendJobAlertEmail = async (job, user) => {
  if (!user.email) {
    console.warn("User email not found. Skipping email notification.");
    return;
  }
  console.log(`Sending job alert email to ${user}`);
  console.log(`Sending job alert email to hai kya bhai ${user.email }`);
  if (!job) {
    console.error("Job data not provided. Skipping email notification.");
    return;
  }
console.log("job hai kya bhai",job)


  const emailType = "Alert";
  const emailBody = createJobAlertEmailTemplate(job, user);

  try {
    await mailFlexSend(emailType, emailBody, user.email);
    console.log(`Email sent to ${user.email}`);
  } catch (error) {
    console.error(`Error sending email to ${user.email}:`, error);
  }
};

module.exports = sendJobAlertEmail;
