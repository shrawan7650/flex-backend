exports.registerEmail = (username) => {
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
            background-color: #4CAF50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .content h1 {
            color: #333333;
          }
          .content p {
            color: #666666;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
          }
          .footer {
            background-color: #333333;
            color: #ffffff;
            text-align: center;
            padding: 10px;
            font-size: 14px;
          }
          .footer a {
            color: #ffffff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to Job Portal</h2>
          </div>
          <div class="content">
            <h1>Hello ${username},</h1>
            <p>Thank you for joining our Job Portal! We're thrilled to have you as part of our community.</p>
            <p>Here, you can explore numerous job opportunities, apply for positions that match your skills, and manage your applications all in one place.</p>
            <p>As a new member, we encourage you to:</p>
            <ul>
              <li>Complete your profile to attract potential employers</li>
              <li>Set up job alerts to stay updated on the latest openings</li>
              <li>Browse through our resources for career tips and guidance</li>
            </ul>
            <p>If you have any questions or need assistance, our support team is here to help.</p>
            <a href="[Job Portal URL]" class="button">Visit Job Portal</a>
            <p>Best regards,<br>The Job Portal Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Job Portal. All rights reserved.</p>
            <p><a href="[Unsubscribe URL]">Unsubscribe</a> from these notifications.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
