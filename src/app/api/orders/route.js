import { ObjectId } from 'mongodb';
import { getDb } from '@/app/api/utils/mongo';

// Connect to MongoDB
async function connectToDatabase() { return getDb(); }

// Telegramga xabar yuborish funksiyasi
async function sendTelegramNotification(order, orderId) {
  try {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) {
      console.warn('TELEGRAM_CHAT_ID muhit o\'zgaruvchisi topilmadi');
      return;
    }

    // Initialize Telegram bot
    const TelegramBot = require('node-telegram-bot-api');
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

    // Format order items
    const itemsText = order.items && Array.isArray(order.items)
      ? order.items
          .map(item => `${item.name} x ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} so'm`)
          .join('\n')
      : 'Mahsulotlar topilmadi';

    // Format the message
    const message = `
🆕 *YANGI BUYURTMA* \#${orderId}\n\n` +
    `👤 *Mijoz*: ${order.customerName || 'Noma\'lum'}\n` +
    `📞 *Tel*: ${order.phone || 'Ko\'rsatilmagan'}\n` +
    `📍 *Manzil*: ${order.address || 'Ko\'rsatilmagan'}\n` +
    `💳 *To\'lov usuli*: ${order.paymentMethod === 'cash' ? 'Naqd pul' : 'Karta orqali'}\n` +
    `\n📦 *Buyurtma*:\n${itemsText}\n\n` +
    `💰 *Jami*: *${order.total?.toLocaleString() || '0'} so'm*\n\n` +
    `⏳ *Holati*: Yangi buyurtma`;

    // Send the message
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Telegram xabari yuborishda xatolik:', error);
    throw error;
  }
}


// GET - Barcha buyurtmalarni olish (admin uchun)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const db = await connectToDatabase();
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get total count for pagination
    const total = await db.collection('orders').countDocuments(query);
    
    // Get paginated orders
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return Response.json({ 
      success: true, 
      data: {
        orders,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Buyurtmalarni olishda xatolik:', error);
    return Response.json({ 
      success: false, 
      error: 'Server xatoligi',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Yangi buyurtma qilish
export async function POST(request) {
  try {
    const db = await connectToDatabase();
    const orderData = await request.json();
    
    // Validate required fields
    const requiredFields = ['customerName', 'phone', 'address', 'items'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      return Response.json(
        { 
          success: false, 
          error: `Quyidagi maydonlar to'ldirilishi shart: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return Response.json(
        { success: false, error: 'Buyurtmada kamida bitta mahsulot bo\'lishi kerak' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + (item.price * (item.quantity || 1)), 
      0
    );

    // Prepare order document
    const order = {
      ...orderData,
      total: totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert order into database
    const result = await db.collection('orders').insertOne(order);
    const orderId = result.insertedId;

    // Send Telegram notification in the background
    sendTelegramNotification({ _id: orderId, ...order })
      .catch(error => console.error('Telegram xabari yuborishda xatolik:', error));

    // Notify SSE subscribers (if any) via in-memory broadcast
    try {
      if (globalThis.__ORDERS_SSE_CLIENTS__) {
        const payload = JSON.stringify({ type: 'order_created', data: { _id: orderId, ...order } });
        for (const res of globalThis.__ORDERS_SSE_CLIENTS__) {
          res.write(`data: ${payload}\n\n`);
        }
      }
    } catch (e) {
      console.warn('SSE broadcast failed:', e);
    }

    return Response.json({ 
      success: true, 
      data: { 
        _id: orderId,
        ...order 
      } 
    });
  } catch (error) {
    console.error('Xatolik yuz berdi:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Server xatosi: ' + (error.message || 'Noma\'lum xatolik yuz berdi') 
      },
      { status: 500 }
    );
  }
}

// PATCH - Buyurtma holatini yangilash
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      return Response.json(
        { success: false, error: 'Buyurtma ID si kiritilmagan' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const updateData = await request.json();
    
    // Allowed fields to update
    const allowedUpdates = ['status', 'paymentStatus', 'trackingNumber', 'adminNotes'];
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { success: false, error: 'Yangilash uchun hech qanday maydon kiritilmagan' },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date();

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return Response.json(
        { success: false, error: 'Buyurtma topilmadi' },
        { status: 404 }
      );
    }

    // If status was updated, send notification
    if (updates.status) {
      const statusText = getStatusText(updates.status);
      
      // Send status update notification
      try {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (chatId) {
          const TelegramBot = require('node-telegram-bot-api');
          const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
          
          const message = `\#${orderId}\n\n🔄 *Buyurtma holati yangilandi*\n\n📌 *Yangi holat*: ${statusText}\n\nℹ️ Batafsil ma\'lumot uchun admin paneliga kiring.`;
          
          await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        }
      } catch (error) {
        console.error('Status yangilash xabari yuborishda xatolik:', error);
      }
    }

    // Get the updated order
    const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });

    return Response.json({ 
      success: true, 
      data: updatedOrder
    });
  } catch (error) {
    console.error('Xatolik yuz berdi:', error);
    return Response.json(
      { success: false, error: 'Server xatosi: ' + error.message },
      { status: 500 }
    );
  }
}
