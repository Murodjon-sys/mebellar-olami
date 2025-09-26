import { ObjectId } from 'mongodb';
import { getDb } from '@/app/api/utils/mongo';

// Connect to MongoDB
async function connectToDatabase() { return getDb(); }

// PUT - Update order status (for admin)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    // Allowed status values
    const allowedStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    
    if (!status || !allowedStatuses.includes(status)) {
      return Response.json({ 
        success: false, 
        error: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}`
      }, { status: 400 });
    }

    const db = await connectToDatabase();
    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return Response.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      data: result.value,
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return Response.json({ 
      success: false, 
      error: 'Server error',
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Get single order by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const db = await connectToDatabase();
    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    
    if (!order) {
      return Response.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return Response.json({ 
      success: true, 
      data: order 
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return Response.json({ 
      success: false, 
      error: 'Server error',
      details: error.message 
    }, { status: 500 });
  }
}