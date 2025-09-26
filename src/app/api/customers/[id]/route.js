import { ObjectId } from 'mongodb';
import { getDb } from '@/app/api/utils/mongo';

export async function GET(request, { params }) {
  try {
    const db = await getDb();
    const customer = await db.collection('customers').findOne(
      { _id: new ObjectId(params.id) },
      { projection: { password: 0 } }
    );
    if (!customer) return Response.json({ success: false, error: 'Topilmadi' }, { status: 404 });
    return Response.json({ success: true, data: customer });
  } catch (error) {
    console.error('Mijozni olishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const allowed = ['name', 'email', 'phone'];
    const updates = {};
    for (const k of allowed) if (body[k] !== undefined) updates[k] = body[k];
    if (!Object.keys(updates).length) return Response.json({ success: false, error: 'Maydonlar yo\'q' }, { status: 400 });
    updates.updatedAt = new Date();
    const db = await getDb();
    const result = await db.collection('customers').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updates },
      { returnDocument: 'after', projection: { password: 0 } }
    );
    if (!result.value) return Response.json({ success: false, error: 'Topilmadi' }, { status: 404 });
    return Response.json({ success: true, data: result.value });
  } catch (error) {
    console.error('Mijozni yangilashda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = await getDb();
    const result = await db.collection('customers').deleteOne({ _id: new ObjectId(params.id) });
    if (!result.deletedCount) return Response.json({ success: false, error: 'Topilmadi' }, { status: 404 });
    return Response.json({ success: true, message: 'O\'chirildi' });
  } catch (error) {
    console.error('Mijozni o\'chirishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}


