import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initializeEmailService } from './utils/emailService.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Contact form specific rate limiting (stricter)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 contact form submissions per hour
  message: { success: false, message: 'Too many contact form submissions, please try again later.' },
});
app.use('/api/contact', contactLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Initialize email service
initializeEmailService();

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
🚀 Server is running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Local:    http://localhost:${PORT}
🔧 Mode:     ${config.nodeEnv}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
