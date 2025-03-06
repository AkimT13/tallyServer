import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createPrivateKey } from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMP_QR_PATH = path.join(__dirname, "temp-qrcode.png"); // Single temp QR code file

export async function sendEmailHtml(recipientEmail, subject, templateName, data) {
  try {
    // Authentication for sending email
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD_KEY,
      },
      dkim: {
        domainName: "sfhacks.io",
        keySelector: "default",
        privateKey: process.env.DKIM_PRIVATE_KEY,
      },
    });

    // Read the HTML template file from the project folder
    const templatePath = path.join(__dirname, `/templates/${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, "utf8");

    // Compile the Handlebars template
    const template = Handlebars.compile(source);
    const htmlToSend = template(data);

    // Attachments including the QR code
    const mailOptions = {
      from: {
        name: "SF Hacks Team",
        address: process.env.EMAIL_ACCOUNT,
      },
      to: recipientEmail,
      subject: subject,
      html: htmlToSend, // Injected HTML with user-specific data
      attachments: [
        {
          filename: "qrcode.png",
          path: TEMP_QR_PATH, // Attach the generated QR code file
          cid: "qrcode_cid",
        },
        {
          filename: "sfhackslogo.png",
          path: path.join(__dirname, "/templates/images/sfhackslogo.png"),
          cid: "sfhackslogo",
        },
        {
          filename: "discord.png",
          path: path.join(__dirname, "/templates/images/discord.png"),
          cid: "discordlogo",
        },
        {
          filename: "instagram.png",
          path: path.join(__dirname, "/templates/images/instagram.png"),
          cid: "instagramlogo",
        },
        {
          filename: "solo.png",
          path: path.join(__dirname, "/templates/images/solo.png"),
          cid: "solologo",
        },
      ],
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);

    // ✅ Delete the QR code file after sending
    fs.unlink(TEMP_QR_PATH, (err) => {
      if (err) console.error("Failed to delete temp QR file:", err);
    });

    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
}
