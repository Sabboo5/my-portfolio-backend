import sgMail from '@sendgrid/mail';
import type { ContactFormData } from '../types/index.js';

if (!process.env.SENDGRID_PASS || !process.env.CONTACT_EMAIL) {
  console.warn('⚠️ SendGrid not configured. Contact form emails will log to console.');
}

sgMail.setApiKey(process.env.SENDGRID_PASS);

export const sendContactEmail = async (data: ContactFormData): Promise<void> => {
  const { name, email, subject, message } = data;

  if (!process.env.SENDGRID_PASS || !process.env.CONTACT_EMAIL) {
    console.log('📧 Logging contact form to console because SendGrid is not ready.');
    console.log(data);
    return;
  }

  const msg = {
    to: process.env.CONTACT_EMAIL,
    from: process.env.CONTACT_EMAIL,
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

  await sgMail.send(msg);
};
