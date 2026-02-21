import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config, isDevelopment } from '../config';
import type { ContactFormData } from '../types/index.js';

let transporter: Transporter | null = null;

export const initializeEmailService = (): void => {
  if (!config.email.user || !config.email.pass) {
    console.warn('⚠️ Email service not configured. Contact form will log messages to console.');
    return;
  }

  // Use explicit types and cast for Render env variables
  const host = process.env.SMTP_HOST || config.email.host;
  const port = Number(process.env.SMTP_PORT || config.email.port);
  const secure = (process.env.SMTP_SECURE === 'true') || config.email.secure;
  const user = process.env.SMTP_USER || config.email.user;
  const pass = process.env.SMTP_PASS || config.email.pass;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  // Verify connection
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email service connection failed:', error.message);
      transporter = null;
    } else {
      console.log('✅ Email service ready on Render');
    }
  });
};

export const sendContactEmail = async (data: ContactFormData): Promise<void> => {
  const { name, email, subject, message } = data;

  if (isDevelopment || !transporter) {
    console.log('\n📧 New Contact Form Submission (Logged Locally):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL,
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
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width:600px;margin:0 auto;padding:20px;">
  <h2 style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); color:white; padding:20px; border-radius:8px 8px 0 0;">New Contact Form Submission</h2>
  <div style="background:#f8f9fa;padding:20px;border-radius:0 0 8px 8px;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <div style="background:white;padding:15px;border-radius:4px;border-left:4px solid #0ea5e9;">${message.replace(/\n/g,'<br>')}</div>
  </div>
</div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent successfully');
  } catch (err: any) {
    console.error('❌ Failed to send email:', err.message);
  }
};
