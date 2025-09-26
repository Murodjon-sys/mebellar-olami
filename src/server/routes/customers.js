import { Router } from 'express';
import { Customer, Order } from '../models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    let customers = await Customer.find().sort({ createdAt: -1 }).lean();

    // If there are no customers yet but we have orders, auto-sync once
    if (!customers.length) {
      const anyOrder = await Order.findOne().lean();
      if (anyOrder) {
        try {
          const orders = await Order.find({}).select('customerName phone email total createdAt').lean();
          for (const o of orders) {
            const filter = o.phone ? { phone: o.phone } : (o.email ? { email: o.email } : { name: o.customerName, phone: '' });
            await Customer.findOneAndUpdate(
              filter,
              {
                $setOnInsert: { name: o.customerName || 'Mijoz' },
                $set: { phone: o.phone || '', email: o.email || '' },
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
          customers = await Customer.find().sort({ createdAt: -1 }).lean();
        } catch {}
      }
    }

    // Attach computed stats from orders
    const result = [];
    for (const c of customers) {
      const oq = [];
      if (c.phone) oq.push({ phone: c.phone });
      if (c.email) oq.push({ email: c.email });
      if (!oq.length) oq.push({ customerName: c.name });
      const orders = await Order.find({ $or: oq }).select('total createdAt').lean();
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
      const lastOrderDate = orders[0]?.createdAt || null; // since default order not sorted, compute
      const lastDate = orders.reduce((acc, o) => (acc && acc > o.createdAt ? acc : o.createdAt), null);
      result.push({
        ...c,
        totalOrders,
        totalSpent,
        lastOrderDate: lastDate,
      });
    }

    res.json({ success: true, data: result });
  } catch (e) {
    console.error('Customers list error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const c = await Customer.create(req.body);
    res.json({ success: true, data: c });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'status', 'notes'];
    const update = {};
    for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
    const c = await Customer.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!c) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: c });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Backfill customers from existing orders
router.post('/sync', async (_req, res) => {
  try {
    const orders = await Order.find({}).select('customerName phone email').lean();
    let created = 0, updated = 0;
    for (const o of orders) {
      const filter = o.phone ? { phone: o.phone } : (o.email ? { email: o.email } : { name: o.customerName, phone: '' });
      const r = await Customer.findOneAndUpdate(
        filter,
        {
          $setOnInsert: { name: o.customerName || 'Mijoz' },
          $set: { phone: o.phone || '', email: o.email || '' },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // naive count: if doc is new within last second assume created
      if (r.createdAt && Date.now() - new Date(r.createdAt).getTime() < 1500) created++; else updated++;
    }
    res.json({ success: true, data: { created, updated, totalProcessed: orders.length } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message || 'Sync failed' });
  }
});

export default router;


