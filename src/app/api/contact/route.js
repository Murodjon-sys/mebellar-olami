import { Router } from 'express';
import sql from "@/app/api/utils/sql";

const router = Router();

// GET - Bog'lanish xabarlarini olish (admin uchun)
router.get('/', async (req, res) => {
  try {
    const messages = await sql(`
      SELECT * FROM contact_messages 
      ORDER BY created_at DESC
    `);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Xabarlarni olishda xatolik:', error);
    res.status(500).json({ success: false, error: 'Server xatoligi' });
  }
});

// POST - Yangi bog'lanish xabari yuborish
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validatsiya
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Majburiy maydonlar to\'ldirilmagan' 
      });
    }

    // Email formatini tekshirish
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email manzil noto\'g\'ri formatda' 
      });
    }

    const result = await sql(`
      INSERT INTO contact_messages (name, email, phone, message, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, email, phone, message, 'yangi']);

    res.json({ 
      success: true, 
      message_data: result[0],
      message: 'Xabaringiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog\'lanamiz!' 
    });
  } catch (error) {
    console.error('Xabar yuborishda xatolik:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Xabar yuborishda xatolik yuz berdi. Iltimos, keyinroq urinib ko\'ring.' 
    });
  }
});

export default router;