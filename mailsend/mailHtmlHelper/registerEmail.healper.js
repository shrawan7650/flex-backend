exports.registerEmail = (username) => {
  return `
      <div style="background-color: #f2f2f2; padding: 20px;">
        <h2>Welcome to Our FlexiGeeks</h2>
        <p>Hi ${username},</p>
        <p>Thank you for registering with our FlexiGeeks project! We're excited to have you on board.</p>
        <p>Feel free to explore our collection of project and enjoy our services.</p>
        <p>If you have any questions or need assistance, don't hesitate to contact us.</p>
        <p>Best regards,<br>Our FlexiGeeks Team</p>
      </div>`;
};