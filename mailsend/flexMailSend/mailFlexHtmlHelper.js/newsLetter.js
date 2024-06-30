exports.newsletterEmail = () => {
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
        .cta-button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .cta-button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Newsletter</h2>
        </div>
        <div class="content">
          <p>Dear Subscriber,</p>
          <p>Here are the latest updates and news from our company:</p>
          <ul>
            <li>Update 1</li>
            <li>Update 2</li>
            <li>Update 3</li>
          </ul>
          <p>Stay tuned for more exciting developments!</p>
          <a href="#" class="cta-button">Read More</a>
        </div>
        <div class="footer">
          <p>You are receiving this email because you subscribed to our newsletter. If you wish to unsubscribe, please click <a href="#">here</a>.</p>
          <p>Copyright © 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
