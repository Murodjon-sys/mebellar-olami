import { Router } from 'express';
import { Order, Customer } from '../models.js';
import { notifyNewOrder } from '../telegram.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const q = {};
    if (status && status !== 'all') q.status = status;
    const total = await Order.countDocuments(q);
    const orders = await Order.find(q)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ success: true, data: { orders, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) } } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.customerName || !Array.isArray(body.items) || !body.items.length) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }
    // Normalize items
    const isValidObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
    const items = body.items.map((i) => {
      const base = {
        name: String(i.name || ''),
        price: Number(i.price) || 0,
        quantity: Math.max(1, Number(i.quantity) || 1),
      };
      const maybeId = i.productId || i._id;
      if (isValidObjectId(maybeId)) return { ...base, productId: maybeId };
      return base;
    });
    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);

    // Upsert customer from order details
    try {
      const filter = body.phone
        ? { phone: body.phone }
        : (body.email ? { email: body.email } : { name: body.customerName, phone: '' });
      await Customer.findOneAndUpdate(
        filter,
        {
          $setOnInsert: { name: body.customerName },
          $set: {
            phone: body.phone || '',
            email: body.email || '',
          },
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      // Do not fail order creation if customer upsert has an issue
      console.warn('Customer upsert failed:', e?.message || e);
    }

    const order = await Order.create({
      customerName: body.customerName,
      phone: body.phone || '',
      address: body.address || '',
      paymentMethod: body.paymentMethod === 'card' ? 'card' : 'cash',
      cardNumber: body.cardNumber || undefined,
      items,
      total,
    });

    // Broadcast via SSE if any
    try {
      if (req.app.get('sseClients')) {
        const payload = JSON.stringify({ type: 'order_created', data: order });
        for (const resClient of req.app.get('sseClients')) resClient.write(`data: ${payload}\n\n`);
      }
    } catch {}

    notifyNewOrder(order, order._id).catch(() => {});
    res.json({ success: true, data: order });
  } catch (e) {
    console.error('Order create error:', e);
    res.status(400).json({ success: false, error: e.message || 'Order create failed' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['status', 'paymentStatus', 'trackingNumber', 'adminNotes'];
    const updates = {};
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
    updates.updatedAt = new Date();
    const updated = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Order.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ success: false, error: 'Not found' });
    // Optional: notify SSE listeners
    try {
      if (req.app.get('sseClients')) {
        const payload = JSON.stringify({ type: 'order_deleted', data: { _id: req.params.id } });
        for (const resClient of req.app.get('sseClients')) resClient.write(`data: ${payload}\n\n`);
      }
    } catch {}
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Fallback delete via POST (for proxies or environments blocking DELETE)
router.post('/:id/delete', async (req, res) => {
  try {
    const removed = await Order.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ success: false, error: 'Not found' });
    try {
      if (req.app.get('sseClients')) {
        const payload = JSON.stringify({ type: 'order_deleted', data: { _id: req.params.id } });
        for (const resClient of req.app.get('sseClients')) resClient.write(`data: ${payload}\n\n`);
      }
    } catch {}
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write('retry: 10000\n\n');
  const clients = req.app.get('sseClients') || new Set();
  req.app.set('sseClients', clients);
  clients.add(res);
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', t: Date.now() })}\n\n`);
  }, 25000);
  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

export default router;


