import { getDb } from "@/app/api/utils/mongo";

// GET - Statistika ma'lumotlarini olish (admin uchun)
export async function GET(request) {
  try {
    const db = await getDb();

    const [productsCount, ordersCount, totalSalesAgg, reviewsCount] = await Promise.all([
      db.collection('products').countDocuments({}),
      db.collection('orders').countDocuments({}),
      db.collection('orders').aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]).toArray(),
      db.collection('reviews').countDocuments({}).catch(() => 0),
    ]);

    const ordersByStatusAgg = await db.collection('orders').aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();

    const topProductsAgg = await db.collection('orders').aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", sales_count: { $sum: "$items.quantity" } } },
      { $sort: { sales_count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $project: { name: "$product.name", category: "$product.category", price: "$product.price", sales_count: 1 } }
    ]).toArray();

    const productsByCategoryAgg = await db.collection('products').aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]).toArray();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOrdersAgg = await db.collection('orders').aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders_count: { $sum: 1 }, daily_sales: { $sum: "$total" } } },
      { $sort: { _id: -1 } }
    ]).toArray();

    const avgOrderValueAgg = await db.collection('orders').aggregate([
      { $group: { _id: null, average: { $avg: "$total" } } }
    ]).toArray();

    const stats = {
      overview: {
        total_products: productsCount,
        total_orders: ordersCount,
        total_sales: totalSalesAgg[0]?.total || 0,
        total_reviews: reviewsCount || 0,
        average_order_value: avgOrderValueAgg[0]?.average || 0,
      },
      orders_by_status: ordersByStatusAgg.map(i => ({ status: i._id, count: i.count })),
      top_products: topProductsAgg.map(i => ({ name: i.name, category: i.category, price: i.price, sales_count: i.sales_count })),
      products_by_category: productsByCategoryAgg.map(i => ({ category: i._id, count: i.count })),
      recent_orders: recentOrdersAgg.map(i => ({ date: i._id, orders_count: i.orders_count, daily_sales: i.daily_sales })),
    };

    return Response.json({ success: true, stats });
  } catch (error) {
    console.error('Statistika olishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}