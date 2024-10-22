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

    // Get all images from the images folder
    const imagesDir = path.join("tallyServer", "/templates/images");
    const imageFiles = fs.readdirSync(imagesDir);

    // Attach all images found in the folder, with each getting a unique cid
    const attachments = imageFiles.map((file, index) => ({
      filename: file,
      path: path.join(imagesDir, file), // Correctly set the path
      cid: `image${index}` // Generate unique cid for each image
    }));

    // The message to be sent
    const mailOptions = {
      from: {
        name: "SF Hacks Team",
        address: process.env.EMAIL_ACCOUNT,
      },
      to: recipientEmail,
      subject: subject,
      html: htmlToSend, // Injected HTML with user-specific data
      attachments: attachments
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}
