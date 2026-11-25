// Express bootstrap: helmet, CORS, compression, /api router, JSON body,
// SPA static serving in production, error handler.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { bootstrapAdmin } from './services/adminBootstrap.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp() {
  const app = express();

  // Railway sits behind a reverse proxy.
  if (env.trustProxy) {
    app.set('trust proxy', 1);
  }

  // Security headers.
  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },

      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],

          scriptSrc: ["'self'"],

          styleSrc: [
            "'self'",
            'https://fonts.googleapis.com',
            "'unsafe-inline'",
          ],

          fontSrc: [
            "'self'",
            'https://fonts.gstatic.com',
            'data:',
          ],

          imgSrc: [
            "'self'",
            'data:',
            'https:',
          ],

          mediaSrc: [
            "'self'",
            'https://www.youtube.com',
            'https://youtube.com',
          ],

          connectSrc: ["'self'"],

          frameSrc: [
            "'self'",
            'https://www.youtube.com',
            'https://youtube.com',
          ],

          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'self'"],
          formAction: ["'self'"],
        },
      },

      strictTransportSecurity: {
        maxAge: 60 * 60 * 24 * 365,
        includeSubDomains: true,
      },

      referrerPolicy: {
        policy: 'no-referrer',
      },
    }),
  );

  // CORS
  app.use(
    cors({
      origin: env.corsOrigins.includes('*')
        ? true
        : env.corsOrigins,

      credentials: true,
    }),
  );

  // Compression
  app.use(compression());

  // JSON body parser
  app.use(
    express.json({
      limit: '100kb',
    }),
  );

  // --------------------------------------------------
  // Railway healthcheck
  // --------------------------------------------------

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        ok: true,
      },
    });
  });

  // --------------------------------------------------
  // API routes
  // --------------------------------------------------

  app.use('/api', apiRouter);

  // --------------------------------------------------
  // Production frontend
  // --------------------------------------------------

  if (env.nodeEnv === 'production') {
    const distDir = path.resolve(
      __dirname,
      '../../client/dist',
    );

    // Serve Vite build files.
    app.use(
      express.static(distDir, {
        maxAge: '1h',
        index: 'index.html',
      }),
    );

    // SPA fallback.
    // Anything that isn't /api/* goes to React.
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(
        path.join(distDir, 'index.html'),
      );
    });
  }

  // --------------------------------------------------
  // Error handlers
  // --------------------------------------------------

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// ====================================================
// START SERVER (only when run directly, not when imported)
// ====================================================

import { pathToFileURL } from 'node:url';
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
try {
  console.log('[server] creating Express app...');

  const app = await createApp();

  console.log('[server] Express app created');

  // IMPORTANT:
  // Start HTTP server BEFORE connecting to MongoDB.
  //
  // This allows Railway to reach /api/health even if
  // MongoDB takes time to connect.
  app.listen(env.port, '0.0.0.0', () => {
    console.log(
      `[server] listening on 0.0.0.0:${env.port}`,
    );
  });

  // --------------------------------------------------
  // MongoDB
  // --------------------------------------------------

  console.log('[server] connecting to MongoDB...');

  connectDb()
    .then(async () => {
      console.log('[server] MongoDB connected successfully');
      try { await bootstrapAdmin(); console.log('[server] admin bootstrap checked'); } catch (e) { console.error('[server] admin bootstrap failed', e); }
    })
    .catch((err) => {
      console.error(
        '[server] MongoDB connection failed:',
        err,
      );
    });

} catch (err) {
  console.error(
    '[server] failed to start:',
    err,
  );

  process.exit(1);
}
}