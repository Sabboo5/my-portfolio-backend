import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendContactEmail } from '../utils/emailService.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ContactFormData, ApiResponse } from '../types/index.js';

export const submitContactForm = async (
  req: Request<object, ApiResponse, ContactFormData>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg as string);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
      return;
    }

    const { name, email, subject, message } = req.body;

    // Send email
    await sendContactEmail({ name, email, subject, message });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! I will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    next(new AppError('Failed to send message. Please try again later.', 500));
  }
};
