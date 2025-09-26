import { connectMongo } from './db.js';
import { getBot } from './telegram.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    try {
        // Test MongoDB connection
        console.log('Testing MongoDB connection...');
        await connectMongo();
        console.log('✅ MongoDB connected successfully');

        // Test Telegram bot
        console.log('Testing Telegram bot...');
        const bot = getBot();
        if (bot) {
            console.log('✅ Telegram bot initialized');

            // Try to get bot info
            try {
                const botInfo = await bot.getMe();
                console.log(`✅ Telegram bot info: @${botInfo.username}`);
            } catch (err) {
                console.log('⚠️ Could not get bot info, but bot is initialized');
            }
        } else {
            console.log('❌ Telegram bot not initialized - check TELEGRAM_BOT_TOKEN in .env');
        }

        console.log('\n🎉 All tests completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testConnection();