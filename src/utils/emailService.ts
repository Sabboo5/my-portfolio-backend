import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config, isDevelopment } from '../config';
import type { ContactFormData } from '../types/index.js';

let transporter: Transporter | null = null;

console.log('EMAIL CONFIG:', {
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  user: config.email.user,
  passExists: !!config.email.pass,
  contactEmail: config.email.contactEmail,
  isDevelopment,
});

export const initializeEmailService = (): void => {
  if (!config.email.user || !config.email.pass) {
    console.warn('⚠️ Email service not configured. Contact form will log messages to console.');
    return;
  }

  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  // Verify connection
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email service connection failed:', error.message);
      transporter = null;
    } else {
      console.log('✅ Email service ready');
    }
  });
};

export const sendContactEmail = async (data: ContactFormData): Promise<void> => {
  const { name, email, subject, message } = data;

  // In development or if email is not configured, log to console
  if (!transporter) {
    console.log('\n📧 New Contact Form Submission:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${config.email.user}>`,
    to: config.email.contactEmail,
    replyTo: email,
    subject: `Portfolio Contact: ${subject}`,
    text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #0ea5e9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Name:</span> ${name}
      </div>
      <div class="field">
        <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
      </div>
      <div class="field">
        <span class="label">Subject:</span> ${subject}
      </div>
      <div class="field">
        <span class="label">Message:</span>
        <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
