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
        domainName: 'sfhacks.io',
        keySelector: 'default',
        privateKey: process.env.DKIM_PRIVATE_KEY
      },
    });

    // Read the HTML template file from the project folder
    const templatePath = path.join(__dirname, `/templates/${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');

    // Compile the Handlebars template
    const template = Handlebars.compile(source);
    const htmlToSend = template(data);

    // The message to be sent
    const mailOptions = {
      from: {
        name: "SF Hacks Team",
        address: process.env.EMAIL_ACCOUNT,
      },
      to: recipientEmail,
      subject: subject,
      html: htmlToSend,
      attachments: [
        {
          filename: 'sfhackslogo.png',
          path: path.join(__dirname, '/templates/images/sfhackslogo.png'),
          cid: 'sfhackslogo'
        },
        {
          filename: 'discord.png',
          path: path.join(__dirname, '/templates/images/discord.png'),
          cid: 'discordlogo'
        },
        {
          filename: 'instagram.png',
          path: path.join(__dirname, '/templates/images/instagram.png'),
          cid: 'instagramlogo'
        },
        {
          filename: 'solo.png',
          path: path.join(__dirname, '/templates/images/solo.png'),
          cid: 'solologo'
        }
      ]
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipientEmail}`);
    return true;  
  } catch (err) {
    console.error(`Error sending email to ${recipientEmail}:`, err);
    return false;  
  }
}
