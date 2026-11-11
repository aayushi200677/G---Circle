import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());

const allowedOrigins = new Set([
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Log only the path, never query parameters (password-reset tokens may be in the query string).
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan((tokens, req, res) => [
    tokens.method(req, res),
    req.path,
    tokens.status(req, res),
    `${tokens['response-time'](req, res)} ms`,
  ].join(' ')));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'G-CIRCLE',
    tagline: 'Discover. Collaborate. Build.',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.path}`,
  });
});

app.use(errorHandler);

export default app;
