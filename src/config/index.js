export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10), // Gmail SSL
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,          // no default
    pass: process.env.SMTP_PASS,          // no default
    contactEmail: process.env.CONTACT_EMAIL, // no default
  },
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
