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
import apiRouter from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp() {
  const app = express();

  // Trust the first proxy hop (Railway's load balancer). Required for
  // rate limiting + correct req.ip behind HTTPS-terminating proxies.
  if (env.trustProxy) app.set('trust proxy', 1);

  // Security headers. The default helmet set covers HSTS, X-Frame-Options,
  // X-Content-Type-Options, Referrer-Policy, and more. We add a CSP that
  // still allows the SPA to talk to its own /api plus Google Fonts +
  // YouTube embeds (fallback renderer).
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          mediaSrc: ["'self'", 'https://www.youtube.com', 'https://youtube.com'],
          connectSrc: ["'self'"],
          frameSrc: ["'self'", 'https://www.youtube.com', 'https://youtube.com'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'self'"],
          formAction: ["'self'"],
        },
      },
      strictTransportSecurity: { maxAge: 60 * 60 * 24 * 365, includeSubDomains: true },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  app.use(
    cors({
      origin: env.corsOrigins.includes('*') ? true : env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));

  // Healthcheck.
  app.get('/api/health', (_req, res) => res.json({ success: true, data: { ok: true } }));

  // API router.
  app.use('/api', apiRouter);

  // In production, the same Express process serves the built SPA
  // (client/dist) as static assets. The catch-all is installed AFTER
  // every API route so /api/* always wins over the SPA fallback.
  if (env.nodeEnv === 'production') {
    const distDir = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(distDir, { maxAge: '1h', index: 'index.html' }));
    // SPA fallback: any non-/api GET that doesn't match a file falls
    // through to the SPA. The SPA's router takes it from there.
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}


const isMain = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMain) {
  connectDb()
    .then(() => createApp())
    .then((app) => app.listen(env.port, () => console.log(`[server] listening on :${env.port}`)))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[server] boot failed', err);
      process.exit(1);
    });
}