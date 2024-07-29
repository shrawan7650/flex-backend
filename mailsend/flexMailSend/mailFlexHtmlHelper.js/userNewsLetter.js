exports.userNewsletterEmail = () => {
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
          <h2>Thank You for Registering</h2>
        </div>
        <div class="content">
          <p>Dear Subscriber,</p>
          <p>Thank you for registering for our newsletter! Stay tuned for the latest updates and news from our company.</p>
        </div>
        <div class="footer">
          <p>If you have any questions or need assistance, please contact us.</p>
          <p>Copyright © 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
