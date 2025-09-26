import { getDb } from "@/app/api/utils/mongo";

// GET - Mahsulotlarni olish (filter va qidiruv bilan)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');

    const db = await getDb();
    const query = { available: true };

    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice) {
      query.price = { ...(query.price || {}), $gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      query.price = { ...(query.price || {}), $lte: parseFloat(maxPrice) };
    }
    if (featured === 'true') {
      query.featured = true;
    }

    const products = await db
      .collection('products')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({ success: true, products });
  } catch (error) {
    console.error('Mahsulotlarni olishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

// POST - Yangi mahsulot qo'shish (faqat admin)
export async function POST(request) {
  try {
    const { name, category, price, description, image_url, colors, sizes, featured } = await request.json();

    if (!name || !category || !price) {
      return Response.json({ success: false, error: 'Majburiy maydonlar to\'ldirilmagan' }, { status: 400 });
    }

    const db = await getDb();
    const doc = {
      name,
      category,
      price: parseFloat(price),
      description: description || '',
      image_url: image_url || '',
      colors: colors || [],
      sizes: sizes || [],
      featured: Boolean(featured),
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('products').insertOne(doc);
    return Response.json({ success: true, product: { _id: result.insertedId, ...doc } });
  } catch (error) {
    console.error('Mahsulot qo\'shishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}