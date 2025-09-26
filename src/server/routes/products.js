import { Router } from 'express';
import { Product } from '../models.js';
import { getBot } from '../telegram.js';

const router = Router();

// ✅ GET: barcha mahsulotlar
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, featured, available } = req.query;
    const query = {};

    if (available === 'false') query.available = false;
    else if (available !== 'all') query.available = true;

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice) query.price = { ...(query.price || {}), $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...(query.price || {}), $lte: Number(maxPrice) };
    if (featured === 'true') query.featured = true;

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ✅ POST: yangi mahsulot yaratish
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    // front-enddan imageUrl kelishi ham mumkin, schema image_url
    if (!body.image_url && body.imageUrl) body.image_url = body.imageUrl;

    const { name, price, category } = body;
    if (!name || price === undefined || category === undefined) {
      return res.status(400).json({ success: false, error: 'name, price, category majburiy' });
    }

    const created = await Product.create({
      name: String(name).trim(),
      price: Number(price),
      category: String(category).trim(),
      description: body.description || '',
      image_url: body.image_url || '',
      colors: Array.isArray(body.colors) ? body.colors : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
      featured: Boolean(body.featured),
      available: body.available === false ? false : true,
      _seed: false,
    });

    res.status(201).json({ success: true, data: created });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// ✅ POST: demo mahsulotlarni to'ldirish (seed)
router.post('/seed', async (_req, res) => {
  try {
    const demo = [
      { name: "SMART BED PRO", category: "Yotoq", price: 5990000, description: "Massaj va yoritish tizimiga ega aqlli yotoq.", image_url: "https://images.unsplash.com/photo-1505692794403-34d4982fd1d9?w=800", colors: ["qora","oq"], sizes: ["S","M","L"], featured: true, available: true },
      { name: "MILANO DIVAN", category: "Divan", price: 3290000, description: "Zamonaviy dizayndagi eko-charm divan.", image_url: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800", colors: ["kulrang","jigarrang"], sizes: [], featured: true, available: true },
      { name: "ERGONOMIC PRO", category: "Stul", price: 1290000, description: "Ofis uchun ergonomik stul.", image_url: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800", colors: ["qora","kok"], sizes: [], featured: false, available: true },
      { name: "ROYAL STOL", category: "Stol", price: 2190000, description: "Premium oshxona stoli.", image_url: "https://images.unsplash.com/photo-1617093727343-374698b1b08b?w=800", colors: ["oq","yong'oq"], sizes: [], featured: true, available: true },
      { name: "KIDS COMFORT", category: "To'plam", price: 1490000, description: "Bolalar xonasi uchun qulay to‘plam.", image_url: "https://images.unsplash.com/photo-1598300053654-32c43b0c146b?w=800", colors: ["yashil","pushti"], sizes: [], featured: false, available: true },
      { name: "NORDIC CHAIR", category: "Stul", price: 690000, description: "Skandinaviya uslubidagi stul.", image_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800", colors: ["oq","kulrang"], sizes: [], featured: false, available: true },
      { name: "OAK TABLE", category: "Stol", price: 2790000, description: "Tabiiy eman yog‘ochidan stol.", image_url: "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?w=800", colors: ["yong'oq"], sizes: [], featured: false, available: true },
      { name: "COMFY SOFA", category: "Divan", price: 2590000, description: "Yumshoq va qulay uch kishilik divan.", image_url: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=800", colors: ["kulrang"], sizes: [], featured: false, available: true },
      { name: "MINI COUCH", category: "Divan", price: 1190000, description: "Kichik xonalar uchun ixcham divan.", image_url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800", colors: ["kok","oq"], sizes: [], featured: false, available: true },
      { name: "WARDROBE PRO", category: "Shkaf", price: 3890000, description: "Katta sig‘imli zamonaviy shkaf.", image_url: "https://images.unsplash.com/photo-1555041469-869dc6fdaac6?w=800", colors: ["oq","qora"], sizes: [], featured: true, available: true }
    ].map(p => ({ ...p, _seed: true }));

    // Upsert each demo item by its name. This avoids deleting any documents
    // and guarantees that seeded items persist across restarts.
    const ops = demo.map((p) => ({
      updateOne: {
        filter: { name: p.name },
        update: { $set: p },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(ops, { ordered: false });
    // Fetch the latest state to return to the client
    const latest = await Product.find({ name: { $in: demo.map(d => d.name) } }).sort({ createdAt: -1 });
    res.json({ success: true, data: latest, count: latest.length, upserted: result?.upsertedCount || 0, modified: result?.modifiedCount || 0 });
  } catch (e) {
    console.error('Seed error:', e);
    res.status(400).json({ success: false, error: e.message });
  }
});

// ✅ GET: id bo‘yicha mahsulot
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: p });
  } catch (e) {
    res.status(400).json({ success: false, error: 'Invalid id' });
  }
});

// ✅ PUT: mahsulotni yangilash
router.put('/:id', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.image_url && body.imageUrl) body.image_url = body.imageUrl;

    const p = await Product.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!p) return res.status(404).json({ success: false, error: 'Not found' });

    // Telegramga yangilanish xabari
    try {
      const bot = getBot();
      const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (bot && chatId) {
        const message = `
🔄 *MAHSULOT YANGILANDI*

📦 *Nomi*: ${p.name}
🏷️ *Kategoriya*: ${p.category}
💰 *Narxi*: ${Number(p.price).toLocaleString()} so'm
📝 *Tavsif*: ${p.description || 'Tavsif kiritilmagan'}

📅 Yangilangan vaqt: ${new Date().toLocaleString('uz-UZ')}
        `;
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      }
    } catch (err) {
      console.error('Telegram notification error:', err);
    }

    res.json({ success: true, data: p });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// ✅ DELETE: mahsulotni o‘chirish
router.delete('/:id', async (req, res) => {
  try {
    const r = await Product.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ success: false, error: 'Not found' });

    // Telegramga o‘chirilganligi haqida xabar
    try {
      const bot = getBot();
      const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (bot && chatId) {
        const message = `
🗑️ *MAHSULOT O'CHIRILDI*

📦 *Nomi*: ${r.name}
🏷️ *Kategoriya*: ${r.category}
💰 *Narxi*: ${Number(r.price).toLocaleString()} so'm

📅 O'chirilgan vaqt: ${new Date().toLocaleString('uz-UZ')}
        `;
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      }
    } catch (err) {
      console.error('Telegram notification error:', err);
    }

    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

export default router;
