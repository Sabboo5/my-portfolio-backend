import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { ContactFormData } from '../types/index.js';

let transporter: Transporter | null = null;

// Initialize SendGrid transporter
export const initializeEmailService = (): void => {
  if (!process.env.SENDGRID_USER || !process.env.SENDGRID_PASS) {
    console.warn('⚠️ Email service not configured. Contact form will log messages to console.');
    return;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_PASS,
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

// Send contact form email
export const sendContactEmail = async (data: ContactFormData): Promise<void> => {
  const { name, email, subject, message } = data;

  if (!transporter) {
    console.log('📧 Logging contact form to console because transporter is not ready.');
    console.log(data);
    return;
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.CONTACT_EMAIL}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: `Portfolio Contact: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
    html: `<div>
             <h2>New Contact Form Submission</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Message:</strong></p>
             <div>${message.replace(/\n/g,'<br>')}</div>
           </div>`,
  };

  await transporter.sendMail(mailOptions);
};
