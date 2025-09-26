import { Router } from 'express';
import { ContactMessage } from '../models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }
    const created = await ContactMessage.create({ name, email, phone, message, status: 'new' });
    res.json({ success: true, data: created, message: 'Xabaringiz muvaffaqiyatli yuborildi!' });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

export default router;


