exports.aboutEmail = (fullName, email, number, message) => {
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
          <h2>Message from Contact Form</h2>
        </div>
        <div class="content">
          <p><strong>Full Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone Number:</strong> ${number}</p>
          <p><strong>Message:</strong> <p>${message}</p></p>
         
        </div>
        <div class="footer">
          <p>This message was sent via the contact form on your website.</p>
          <p>Best regards,<br>Your Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
