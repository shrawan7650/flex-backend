const createJobAlertEmailTemplate = (job, user) => {
  // Email template for job alert notifications
  console.log("template job data",job);
  console.log("template user data",user);

  return `
  
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }
      .header {
        background-color: #007bff;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 20px;
      }
      .content h2 {
        color: #333333;
      }
      .content p {
        color: #666666;
        line-height: 1.6;
      }
      .job-title {
        font-size: 22px;
        font-weight: bold;
        color: #007bff;
        margin: 10px 0;
      }
      .company {
        font-size: 16px;
        color: #555555;
        margin: 5px 0;
      }
      .logo {
        display: block;
        max-width: 100%;
        height: auto;
        margin: 20px 0;
      }
      .apply-button {
        display: inline-block;
        background-color: #007bff;
        color: #ffffff;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 20px;
      }
      .footer {
        background-color: #333333;
        color: #ffffff;
        text-align: center;
        padding: 10px;
        font-size: 14px;
      }
      .footer p {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>New Job Alert: ${job.jobNiche}</h2>
      </div>
      <div class="content">
        <p>Hi ${user.name},</p>
        <p>We have found a new job that matches your preferences:</p>
        <img src="${job.companyLogo}" alt="${job.companyName} Logo" class="logo">
        <p class="job-title">${job.title}</p>
        <p class="company">${job.companyName} - ${job.location}</p>
        <p>${job.jobIntroduction}</p>
        <p><strong>Application Deadline:</strong> ${new Date(job.applicationDeadline).toLocaleDateString()}</p>
      
        <a href="[Job Application Link]" class="apply-button">Apply Now</a>
      </div>
      <div class="footer">
        <p>&copy; 2024 Job Portal. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>

  `;
};

module.exports = createJobAlertEmailTemplate;
