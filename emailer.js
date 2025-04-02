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
    //bruh
    const templatePath = path.join(__dirname, `/templates/${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, "utf8");

    const template = Handlebars.compile(source);
    const htmlToSend = template(data);

    const mailOptions = {
      from: {
        name: "SF Hacks Team",
        address: process.env.EMAIL_ACCOUNT,
      },
      to: recipientEmail,
      subject,
      html: htmlToSend,
    };

    let shouldDeleteTempQR = false;
    if (templateName === "qrCode" && fs.existsSync(TEMP_QR_PATH)) {
      mailOptions.attachments = [
        {
          filename: "qrcode.png",
          path: TEMP_QR_PATH,
          cid: "qrcode_cid",
        },
      ];
      shouldDeleteTempQR = true;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);

    if (shouldDeleteTempQR) {
      fs.unlink(TEMP_QR_PATH, (err) => {
        if (err) console.error("Failed to delete temp QR file:", err);
      });
    }

    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
}
