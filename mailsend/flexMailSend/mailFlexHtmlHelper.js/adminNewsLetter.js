exports.adminNewsletterEmail = (userEmail) => {
  return `
    <html>
    <head>
      <style>
        .container {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          padding: 20px;
          border-radius: 5px;
          max-width: 600px;
          margin: auto;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          text-align: center;
          padding: 10px 0;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .content p {
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #555;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Newsletter Subscription</h2>
        </div>
        <div class="content">
          <p>Dear Admin,</p>
          <p>A new user has registered for the newsletter:</p>
          <ul>
            <li>Email: ${userEmail}</li>
          </ul>
        </div>
        <div class="footer">
          <p>Keep track of the new subscriptions and engage with your audience effectively.</p>
          <p>Copyright © 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
