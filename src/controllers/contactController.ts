import type { Request, Response } from 'express';
import { sendContactEmail } from '../services/emailService.js';

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await sendContactEmail({ name, email, subject, message });

    return res.status(200).json({ message: 'Your message has been sent successfully!' });
  } catch (err: any) {
    console.error('Error sending contact form email:', err.message);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
