"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = exports.isDevelopment = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();

// ---------------------
// CONFIG
// ---------------------
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        contactEmail: process.env.CONTACT_EMAIL || '',
    },
};

exports.isDevelopment = exports.config.nodeEnv === 'development';
exports.isProduction = exports.config.nodeEnv === 'production';

// ---------------------
// EXPRESS TRUST PROXY
// ---------------------
// In your main app file (e.g., app.js or index.js for Express), add this *before* rate limiters:
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();

// Trust first proxy (Render / other hosting)
app.set('trust proxy', 1);

// Now you can safely use express-rate-limit behind Render’s proxy

//# sourceMappingURL=index.js.map
