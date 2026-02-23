import sgMail from '@sendgrid/mail';
import type { ContactFormData } from '../types/index.js';
import { config, isDevelopment } from '../config.js';

// Set SendGrid API key once
if (!config.sendgridApiKey || !config.email.contactEmail || !config.email.emailFrom) {
  console.warn('⚠️ SendGrid not fully configured. Contact form will log messages to console.');
} else {
  sgMail.setApiKey(config.sendgridApiKey);
}

export const sendContactEmail = async (data: ContactFormData): Promise<void> => {
  const { name, email, subject, message } = data;

  // Log locally if SendGrid is not ready
  if (!config.sendgridApiKey || !config.email.contactEmail || !config.email.emailFrom || isDevelopment) {
    console.log('\n📧 New Contact Form Submission:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  const msg = {
    to: config.email.contactEmail,
    from: config.email.emailFrom,
    replyTo: email,
    subject: `Portfolio Contact: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
             <h2>New Contact Form Submission</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Message:</strong></p>
             <div>${message.replace(/\n/g,'<br>')}</div>
           </div>`,
  };

  try {
    await sgMail.send(msg);
  } catch (error: any) {
    console.error('❌ Contact form error:', error.message || error);
    throw new Error('Failed to send message. Please try again later.');
  }
};
