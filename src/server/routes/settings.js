import { Router } from 'express';
import { User } from '../models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('-password');
    res.json({ success: true, data: admin || null });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { id, name, email } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'ID required' });
    const updated = await User.findOneAndUpdate({ _id: id, role: 'admin' }, { name, email }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.patch('/password', async (req, res) => {
  try {
    const { id, password } = req.body;
    if (!id || !password) return res.status(400).json({ success: false, error: 'ID and password required' });
    const updated = await User.findOneAndUpdate({ _id: id, role: 'admin' }, { password }, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Password updated' });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

export default router;


