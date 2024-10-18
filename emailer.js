import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

dotenv.config();

export async function sendEmailHtml(recipientEmail, subject, templateName, data) {
  try {
    // Authentication for our sending email
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD_KEY,
      },
    });

    // Read the HTML template file from the project folder
    const templatePath = path.join(".", `/templates/${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');

    // Compile the Handlebars template
    const template = Handlebars.compile(source);

    // Generate the final HTML with injected data
    const htmlToSend = template(data);

    // The message to be sent
    const mailOptions = {
      from: {
        name: "SF Hacks Team",
        address: process.env.EMAIL_ACCOUNT,
      },
      to: recipientEmail,
      subject: subject,
      html: htmlToSend, // Injected HTML with user-specific data
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}
