import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectMongo } from './db.js';
import products from './routes/products.js';
import orders from './routes/orders.js';
import customers from './routes/customers.js';
import contact from './routes/contact.js';
import stats from './routes/stats.js';
import settings from './routes/settings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

// API routes (same-origin under /api)
app.use('/api/products', products);
app.use('/api/orders', orders);
app.use('/api/customers', customers);
app.use('/api/contact', contact);
app.use('/api/stats', stats);
app.use('/api/settings', settings);

// Simple healthcheck
app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));

// Static frontend (Vite build output)
const distDir = path.resolve(__dirname, '../../dist');
app.use(express.static(distDir));

// SPA fallback to index.html for client routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distDir, 'index.html'));
});

export async function start() {
  await connectMongo();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Web app running on http://localhost:${port}`);
  });
}

export default app;
