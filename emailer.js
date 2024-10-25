import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createPrivateKey } from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      dkim: {
        domainName: 'sfhacks.io',
        keySelector: 'default',
        privateKey: process.env.DKIM_PRIVATE_KEY

      }
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
      attachments: [{
        filename: 'logopupleBlue.png',
        path: __dirname + '/templates/images/logopupleBlue.png',
        cid: 'sfhackslogo'
      },
      {
        filename: 'discord.png',
        path: __dirname + '/templates/images/discord.png',
        cid: 'discordlogo'
      },
      {
        filename: 'instagram.png',
        path: __dirname + '/templates/images/instagram.png',
        cid: 'instagramlogo'
      },
      {
        filename: 'solo.png',
        path: __dirname + '/templates/images/solo.png',
        cid: 'solologo'
      }
      ]
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}
