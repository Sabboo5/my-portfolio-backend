import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config, isDevelopment } from '../config';
import type { ContactFormData } from '../types/index.js';

let transporter: Transporter | null = null;

// Log email config for debugging
console.log('EMAIL CONFIG:', {
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  user: process.env.SENDGRID_USER,
  passExists: !!process.env.SENDGRID_PASS,
  contactEmail: process.env.CONTACT_EMAIL,
  isDevelopment,
});

export const initializeEmailService = (): void => {
  if (!process.env.SENDGRID_PASS || !process.env.SENDGRID_USER) {
    console.warn('⚠️ Email service not configured. Contact form will log messages to console.');
    return;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // false for TLS, port 587
    auth: {
      user: process.env.SENDGRID_USER, // must be "apikey"
      pass: process.env.SENDGRID_PASS, // your API key
    },
  });

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
    console.log('\n📧 New Contact Form Submission:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.CONTACT_EMAIL}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: `Portfolio Contact: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f8f8f8; padding: 10px; border-left: 4px solid #0ea5e9;">${message.replace(/\n/g, '<br>')}</div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
