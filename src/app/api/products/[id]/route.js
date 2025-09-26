import { getDb } from "@/app/api/utils/mongo";
import { ObjectId } from "mongodb";

// GET - Bitta mahsulotni olish
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const db = await getDb();
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });

    if (!product) {
      return Response.json({ success: false, error: 'Mahsulot topilmadi' }, { status: 404 });
    }

    return Response.json({ success: true, product });
  } catch (error) {
    console.error('Mahsulot olishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

// PUT - Mahsulotni yangilash (faqat admin)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    const allowedFields = ['name', 'category', 'price', 'description', 'image_url', 'colors', 'sizes', 'featured', 'available'];
    const updates = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updates[key] = key === 'price' ? parseFloat(data[key]) : data[key];
      }
    }
    if (Object.keys(updates).length === 0) {
      return Response.json({ success: false, error: 'Yangilanadigan maydon topilmadi' }, { status: 400 });
    }
    updates.updatedAt = new Date();

    const db = await getDb();
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return Response.json({ success: false, error: 'Mahsulot topilmadi' }, { status: 404 });
    }

    return Response.json({ success: true, product: result.value });
  } catch (error) {
    console.error('Mahsulot yangilashda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

// DELETE - Mahsulotni o'chirish (faqat admin)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const db = await getDb();
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return Response.json({ success: false, error: 'Mahsulot topilmadi' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Mahsulot muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    console.error('Mahsulot o\'chirishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}