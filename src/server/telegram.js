import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// Load environment variables from .env at process start
dotenv.config();

let botInstance = null;

export function getBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
  if (!token) return null;
  if (!botInstance) botInstance = new TelegramBot(token, { polling: false });
  if (botInstance) {
    console.log('[OK] Telegram bot ready');
  }
  return botInstance;
}

export async function notifyNewOrder(order, orderId) {
  try {
    const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
    const bot = getBot();
    if (!chatId || !bot) return;
    const itemsText = (order.items || [])
      .map((i) => `${i.name} x ${i.quantity} = ${(i.price * i.quantity).toLocaleString()} so'm`)
      .join('\n');
    const maskedCard = order.cardNumber ? `${order.cardNumber}`.replace(/\D/g, '').replace(/.(?=.{4})/g, '*') : '—';
    const paymentText = order.paymentMethod === 'card' ? `Karta orqali\n💳 *Karta*: ${maskedCard}` : 'Naqd pul';
    const message = `\n🆕 *YANGI BUYURTMA* #${orderId}\n\n` +
      `👤 *Mijoz*: ${order.customerName || 'Noma' + "'" + 'lum'}\n` +

      `📞 *Tel*: ${order.phone || 'Ko' + "'" + 'rsatilmagan'}\n` +
      `📍 *Manzil*: ${order.address || 'Ko' + "'" + 'rsatilmagan'}\n` +

      `💳 *To'lov*: ${paymentText}\n` +
      `\n📦 *Buyurtma*:\n${itemsText}\n\n` +

      `💰 *Jami*: *${order.total?.toLocaleString() || '0'} so'm*\n\n` +
      `⏳ *Holati*: ${order.status || 'pending'}`;
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Telegram notify error:', err);
  }
}


