import { getDb } from '@/app/api/utils/mongo';

// GET: list customers (basic fields)
export async function GET(request) {
  try {
    const db = await getDb();
    const customers = await db
      .collection('customers')
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return Response.json({ success: true, data: customers });
  } catch (error) {
    console.error('Mijozlar ro\'yxatini olishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

// POST: create customer (minimal)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;
    if (!name || !email) {
      return Response.json({ success: false, error: 'Ism va email shart' }, { status: 400 });
    }
    const db = await getDb();
    const doc = { name, email, phone: phone || '', createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection('customers').insertOne(doc);
    return Response.json({ success: true, data: { _id: result.insertedId, ...doc } });
  } catch (error) {
    console.error('Mijoz yaratishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}


