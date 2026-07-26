// Express bootstrap: helmet, CORS, /api router, JSON body, error handler.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp() {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: env.corsOrigins.includes('*') ? true : env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  // Static uploads (per docs/DATABASE.md Storage Layout).
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

  // Healthcheck.
  app.get('/api/health', (_req, res) => res.json({ success: true, data: { ok: true } }));

  // Mount the API.
  app.use('/api', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// Boot when run directly (not on import).
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