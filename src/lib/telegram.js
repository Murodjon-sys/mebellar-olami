const TelegramBot = require('node-telegram-bot-api');

// Initialize the Telegram bot with your bot token
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Chat ID where notifications will be sent (can be a group or channel ID)
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

/**
 * Send a notification to the admin about a new order
 * @param {Object} order - The order details
 * @param {string} order._id - Order ID
 * @param {string} order.customerName - Customer's name
 * @param {string} order.phone - Customer's phone number
 * @param {string} order.address - Delivery address
 * @param {Array} order.items - Array of order items
 * @param {number} order.total - Total order amount
 * @param {string} order.paymentMethod - Payment method (cash/card)
 * @returns {Promise<Object>} - Result of the sendMessage operation
 */
async function sendNewOrderNotification(order) {
  try {
    // Format order items
    const itemsText = order.items
      .map(
        (item, index) => 
          `${index + 1}. ${item.name} - ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.quantity * item.price)}`
      )
      .join('\n');

    // Format the message
    const message = `
🆕 *YANGI BUYURTMA* \#${order._id}\n
👤 *Mijoz*: ${order.customerName}\n📞 *Tel*: ${order.phone}\n📍 *Manzil*: ${order.address}\n💳 *To\'lov usuli*: ${order.paymentMethod === 'cash' ? 'Naqd pul' : 'Karta orqali'}\n\n📦 *Buyurtma*:\n${itemsText}\n\n💰 *Jami*: *${formatPrice(order.total)}*\n\n⏳ *Holati*: Yangi buyurtma`;

    // Send the message
    return await bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    throw error;
  }
}

/**
 * Send order status update notification
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {string} statusText - Status text to display
 * @returns {Promise<Object>} - Result of the sendMessage operation
 */
async function sendStatusUpdate(orderId, status, statusText) {
  try {
    const statusEmoji = getStatusEmoji(status);
    const message = `\#${orderId}\n\n🔄 *Buyurtma holati yangilandi*\n\n📌 *Yangi holat*: ${statusEmoji} ${statusText}\n\nℹ️ Batafsil ma'lumot uchun admin paneliga kiring.`;

    return await bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error sending status update notification:', error);
    throw error;
  }
}

/**
 * Format price to UZS
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get status emoji based on status
 * @param {string} status - Order status
 * @returns {string} Status emoji
 */
function getStatusEmoji(status) {
  switch (status) {
    case 'processing':
      return '🔄';
    case 'shipped':
      return '🚚';
    case 'delivered':
      return '✅';
    case 'cancelled':
      return '❌';
    default:
      return 'ℹ️';
  }
}

module.exports = {
  sendNewOrderNotification,
  sendStatusUpdate,
};
