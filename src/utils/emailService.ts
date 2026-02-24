import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config';
import type { ContactFormData } from '../types/index.js';

let transporter: Transporter | null = null;

export const initializeEmailService = (): void => {
  if (!config.email.user || !config.email.pass) {
    console.warn('⚠️ Email service not configured. Contact form will not send emails.');
    return;
  }

  // Gmail prefers port 465 with SSL
  transporter = nodemailer.createTransport({
    host: config.email.host || 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: config.email.user,
      pass: config.email.pass, // must be Gmail App Password
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

  if (!transporter) {
    throw new Error('Email service not initialized. Check SMTP settings.');
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${config.email.user}>`,
    to: config.email.contactEmail,
    replyTo: email,
    subject: `Portfolio Contact: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    throw err; // propagate to route handler
  }
};

console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL);
console.log('NODE_ENV:', process.env.NODE_ENV);
