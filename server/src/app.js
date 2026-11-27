import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getConfig } from './config/env.js';
import { isDbConnected } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { requireClientHeader, requireDatabase, sanitizeRequest } from './middleware/security.js';
import { cleanupUploadOnError } from './middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const config = getConfig();
  const app = express();

  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / non-browser requests (no Origin header) and whitelisted origins.
        if (!origin || config.clientOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Requested-With', 'Authorization'],
      maxAge: 600,
    }),
  );

  // Request logging without bodies, cookies or auth headers.
  if (!config.isTest) app.use(morgan(config.isProduction ? 'combined' : 'dev'));

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(cookieParser());

  // Health check (does not require the database, reports its state)
  app.get('/api/v1/health', (_req, res) => {
    const db = isDbConnected() ? 'connected' : 'disconnected';
    res.status(db === 'connected' ? 200 : 503).json({
      success: db === 'connected',
      data: { status: db === 'connected' ? 'ok' : 'degraded', database: db, uptime: Math.round(process.uptime()) },
    });
  });

  app.use('/api/v1', apiLimiter(), requireClientHeader, requireDatabase, sanitizeRequest, apiRoutes);

  // Single-server fullstack mode: Serve built React client if available
  const clientDist = process.env.CLIENT_DIST_PATH || path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(cleanupUploadOnError);
  app.use(errorHandler);

  return app;
}
