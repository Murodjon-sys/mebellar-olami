import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Database connection
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGO_URI is not set in .env');
}

mongoose.connection.on('connected', () => {
  console.log('[OK] Mongoose connected');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

await mongoose.connect(mongoUri, {
  dbName: process.env.MONGODB_DB || 'mebel-sayti',
});

// Product model
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const Product = mongoose.models.SimpleProduct || mongoose.model('SimpleProduct', productSchema);

// Routes
app.post('/products', async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body || {};
    if (!name || typeof price !== 'number') {
      return res.status(400).json({ success: false, error: 'name and price are required' });
    }
    const doc = await Product.create({ name, price, category, imageUrl });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/products', async (_req, res) => {
  try {
    const list = await Product.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (price !== undefined) update.price = Number(price);
    if (category !== undefined) update.category = category;
    if (imageUrl !== undefined) update.imageUrl = imageUrl;
    const doc = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: 'Not found' });
    return res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid id' });
  }
});

export default app;


