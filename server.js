import express from 'express';
import cors from 'cors';
import contactRouter from './src/server/routes/contact.js';
import dotenv from 'dotenv';
import { connectMongo } from './src/server/db.js';
import productsRouter from './src/server/routes/products.js';
import ordersRouter from './src/server/routes/orders.js';
import customersRouter from './src/server/routes/customers.js';
import settingsRouter from './src/server/routes/settings.js';
import statsRouter from './src/server/routes/stats.js';
import reviewsRouter from './src/server/routes/reviews.js';
import { getBot } from './src/server/telegram.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(cors());
app.use(express.json());

// Minimal auth session endpoint to satisfy frontend auth utilities in dev
app.get('/api/auth/session', (_req, res) => {
  res.json({ user: null, expires: null });
});
// API Routes
app.use('/api/contact', contactRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/reviews', reviewsRouter);
// Root route helper
app.get('/', (_req, res) => {
  res.send('API server running. Try GET /api/health or explore /api/* routes.');
});

// Telegram test endpoint
app.post('/api/telegram/test', async (_req, res) => {
  try {
    const bot = getBot();
    const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!bot) return res.status(400).json({ ok: false, error: 'TELEGRAM_BOT_TOKEN is missing or invalid' });
    if (!chatId) return res.status(400).json({ ok: false, error: 'TELEGRAM_CHAT_ID is missing' });
    await bot.sendMessage(chatId, '✅ Test xabar: serverdan Telegramga ulanish muvaffaqiyatli!');
    res.json({ ok: true });
  } catch (e) {
    console.error('Telegram test error:', e);
    res.status(500).json({ ok: false, error: e?.message || 'Telegram send failed' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  const dbName = process.env.MONGODB_DB || 'mebel-sayti';
  const uriSet = Boolean(process.env.MONGO_URI || process.env.MONGODB_URI);
  res.json({ ok: true, dbName, uriSet });
});

// Start server
connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
