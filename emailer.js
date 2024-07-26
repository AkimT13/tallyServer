import nodemailer from "nodemailer";
import dotenv from "dotenv";


export async function sendEmail(receipientEmail, fName, subject, textString ) {
    try {
  
      //Authentication for our sending email.
      const transporter = nodemailer.createTransport({
        host: "mail.privateemail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_ACCOUNT,// TODO get credentials for email account
          pass: process.env.EMAIL_PASSWORD_KEY, // TODO get credentials for password.
        },
      });
      //The message to be sent.
      const mailOptions = {
        from: {
          name: "SF Hacks Team",
          address: process.env.EMAIL_ACCOUNT,
        },
        to: receipient,
        subject: subject,
        text: textString
        // html: htmlString, // TODO make custom HTML template for each message
  
      };
  
      //Send the email using our authentication. If failed, throw an error.
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
          throw "Unable to send email";
        }
      });
    } catch (err) {
      console.error("Error", err);
    }
}


