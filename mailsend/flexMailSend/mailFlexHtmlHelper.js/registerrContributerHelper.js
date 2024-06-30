exports.contributionRegisterEmail = (name, yearGraduation, collegeName, number,email) => {
  return `
    <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif;">
      <h2>New Contribution Registration</h2>
      <p>Hi ${name},</p> <p>${email}</p>
      <p>Thank you for your contribution! We're excited to have your support.</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Year of Graduation:</strong> ${yearGraduation}</p>
      <p><strong>College Name:</strong> ${collegeName}</p>
      <p><strong>Number:</strong> ${number}</p>
      <p>If you have any questions or need assistance, don't hesitate to contact us.</p>
      <p>Best regards,<br>Our FlexiGeeks Team</p>
    </div>`;
};
