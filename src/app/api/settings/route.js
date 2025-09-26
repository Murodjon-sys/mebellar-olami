import { getDb } from '@/app/api/utils/mongo';
import { ObjectId } from 'mongodb';

// GET admin profile (single admin for simplicity)
export async function GET() {
  try {
    const db = await getDb();
    const admin = await db.collection('users').findOne({ role: 'admin' }, { projection: { password: 0 } });
    return Response.json({ success: true, data: admin || null });
  } catch (error) {
    console.error('Admin profilini olishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

// PUT update admin profile
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, email } = body;
    if (!id) return Response.json({ success: false, error: 'ID kerak' }, { status: 400 });
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    updates.updatedAt = new Date();
    const db = await getDb();
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id), role: 'admin' },
      { $set: updates },
      { returnDocument: 'after', projection: { password: 0 } }
    );
    if (!result.value) return Response.json({ success: false, error: 'Topilmadi' }, { status: 404 });
    return Response.json({ success: true, data: result.value });
  } catch (error) {
    console.error('Admin profilini yangilashda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

// PATCH change password (no hashing here; add hashing in production)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, password } = body;
    if (!id || !password) return Response.json({ success: false, error: 'ID va parol kerak' }, { status: 400 });
    const db = await getDb();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id), role: 'admin' },
      { $set: { password, updatedAt: new Date() } }
    );
    if (!result.matchedCount) return Response.json({ success: false, error: 'Topilmadi' }, { status: 404 });
    return Response.json({ success: true, message: 'Parol yangilandi' });
  } catch (error) {
    console.error('Parolni o\'zgartirishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}


