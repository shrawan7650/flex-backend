const User = require("../../model/userModel/userSchema.models");
const sendJobAlertEmail = require("./SendJobAlertEmail");

exports.SendJobAlerts = async (job) => {
  try {
    console.log("job", job);
    if (!job) {
      console.log("No job to send alerts for");
      return;
    }

    const users = await User.find({
      role: "user",
      $or: [
        { "niches.firstNiche": job.jobNiche },
        { "niches.secondNiche": job.jobNiche },
        { "niches.thirdNiche": job.jobNiche },
      ],
    });

    console.log("userData", users);
    users.forEach(async (user) => {
      try {
        console.log(`Sending email to: ${user.email}`);
        await sendJobAlertEmail(job, user);
      } catch (error) {
        console.log(`Error sending email to ${user.email}:`, error);
      }
    });
  } catch (error) {
    console.log("Error fetching users:", error);
  }
};
