import { Router } from 'express';
import Product from './models.product.js';

const router = Router();

router.get('/products', async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Invalid id' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body || {};
    if (!name || price === undefined || !category) {
      return res.status(400).json({ success: false, error: 'name, price, category required' });
    }
    const created = await Product.create({ name, price, category, imageUrl });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Validation error' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (price !== undefined) update.price = Number(price);
    if (category !== undefined) update.category = category;
    if (imageUrl !== undefined) update.imageUrl = imageUrl;
    const updated = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Invalid id' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const del = await Product.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Invalid id' });
  }
});

export default router;


