import { Router } from 'express';
import { Product, Order, Customer } from '../models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalCustomers, totalsAgg, statusAgg] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      Customer.countDocuments({}),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    res.json({
      success: true,
      data: {
        overview: {
          total_products: totalProducts,
          total_orders: totalOrders,
          total_customers: totalCustomers,
          total_sales: totalsAgg[0]?.total || 0,
        },
        orders_by_status: statusAgg.map((s) => ({ status: s._id, count: s.count })),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;


