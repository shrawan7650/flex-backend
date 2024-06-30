exports.proposalEmail = (name,number,email,jobrole,aboutYou,link,tech,title,coverabout,date,firstTalk,image) => {
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
        .image-container {
          width:30px;
          display:flex;
          justify-content: center;
          align-items: center;
          
          width:400px;
          height:400px;

    
          background-color: #333;
          border: 2px solid #fff;
          overflow: hidden;


          
          margin-top: 20px;
        }
        .image-container img {
      
         
          object-fit: cover;
          width: 100%;
       
        
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Proposal Submission</h2>
        </div>
        <div class="content">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Number:</strong> ${number}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Job Role:</strong> ${jobrole}</p>
          <p><strong>About You:</strong> ${aboutYou}</p>
          <p><strong>LinkedIn/Portfolio:</strong> ${link}</p>
          <p><strong>Technologies:</strong> ${tech}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Cover About:</strong> ${coverabout}</p>
          <p><strong>Preferred Date for First Talk:</strong> ${date}</p>
          <p><strong>First Talk Details:</strong> ${firstTalk}</p>
        </div>
        <div class="image-container">
          <img src="${image}" alt="Proposal Image">
        </div>
        <div class="footer">
          <p>Thank you for considering this proposal.</p>
          <p>Best regards,<br>Your Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
