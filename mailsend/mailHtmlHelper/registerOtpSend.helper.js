exports.sendRegisterOTPEmail = (otpCode) => {
  return (
    `
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
            .content h2 {
              color: #333333;
            }
            .content p {
              color: #666666;
              line-height: 1.6;
            }
            .otp {
              font-size: 24px;
              background-color: #007bff;
              color: #ffffff;
              padding: 10px;
              border-radius: 5px;
              text-align: center;
              display: inline-block;
              margin: 20px 0;
            }
            .footer {
              background-color: #333333;
              color: #ffffff;
              text-align: center;
              padding: 10px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>OTP Verification</h2>
            </div>
            <div class="content">
              <p>Hi,</p>
              <p>Your OTP (One-Time Password) for verification is:</p>
              <div class="otp">${otpCode}</div>
              <p>Please enter this OTP to complete the verification process.</p>
              <p>If you didn't request this OTP, you can ignore this email.</p>
              <p>This OTP will expire in a short period of time for security reasons.</p>
              <p>If you have any questions or need assistance, please contact us.</p>
              <p>Best regards,<br>The Job Portal Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Job Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  );
};
